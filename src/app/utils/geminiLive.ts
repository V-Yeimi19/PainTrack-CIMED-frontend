/**
 * Cliente Gemini Live API para el navegador (PainTrack CIMED).
 * Conexión de voz en tiempo real: micrófono → Gemini → reproducción por Web Audio.
 *
 * Requisitos: VITE_GEMINI_API_KEY en .env (solo usado en desarrollo/localhost).
 */

import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = (import.meta as unknown as { env: { VITE_GEMINI_API_KEY?: string } }).env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";

const LIVE_CONFIG = {
  responseModalities: [Modality.AUDIO] as Modality[],
  enableAffectiveDialog: true,
  thinkingConfig: { thinkingBudget: 0 },
  systemInstruction:
    "Eres un asistente de la plataforma CIMED para adultos mayores. Habla en español, con frases cortas y amables. Responde en una o dos frases; ve al grano. Ayuda a registrar el dolor y a resolver dudas sobre el proceso. Explica tipos de dolor (apretado, punzante, pulsátil, corriente, quemante, ardor, calambre, cólico, sordo, tirante) cuando pregunten por síntomas.",
  speechConfig: {
    voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
  },
  realtimeInputConfig: {
    automaticActivityDetection: { silenceDurationMs: 150 },
  },
};

export type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

export interface GeminiLiveCallbacks {
  onStatus?: (status: ConnectionStatus) => void;
  onError?: (message: string) => void;
}

const audioQueue: ArrayBuffer[] = [];
let audioContext: AudioContext | null = null;
let isPlaying = false;
/** Tiempo en el contexto donde termina el último chunk (reproducción sin huecos) */
let nextStartTime = 0;
/** Fuente actual (para detenerla en VAD/interrupción) */
let currentSource: AudioBufferSourceNode | null = null;

const SAMPLE_RATE_24K = 24000;

function decodeBase64ToPCM(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

/**
 * Convierte PCM 16-bit little-endian a Float32 -1..1.
 * Usamos DataView para forzar little-endian y evitar sonido corrupto en algunos navegadores.
 */
function pcm16LEToFloat32(buffer: ArrayBuffer): Float32Array {
  const view = new DataView(buffer);
  const numSamples = Math.floor(buffer.byteLength / 2);
  const out = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const s = view.getInt16(i * 2, true);
    out[i] = s / (s < 0 ? 32768 : 32767);
  }
  return out;
}

function playNext() {
  if (audioQueue.length === 0) {
    isPlaying = false;
    return;
  }
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  const ctx = audioContext;
  if (ctx.state === "suspended") ctx.resume();
  isPlaying = true;
  const chunk = audioQueue.shift()!;
  const float32 = pcm16LEToFloat32(chunk);
  const buffer = ctx.createBuffer(1, float32.length, SAMPLE_RATE_24K);
  buffer.getChannelData(0).set(float32);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  currentSource = source;
  const startTime = Math.max(ctx.currentTime, nextStartTime);
  nextStartTime = startTime + buffer.duration;
  source.start(startTime);
  source.stop(nextStartTime);
  source.onended = () => {
    currentSource = null;
    playNext();
  };
}

function playAudioChunk(base64: string) {
  const chunk = decodeBase64ToPCM(base64);
  audioQueue.push(chunk);
  if (!isPlaying) playNext();
}

/** Detiene la reproducción y vacía la cola (p. ej. cuando VAD detecta interrupción). */
export function stopPlayback() {
  audioQueue.length = 0;
  isPlaying = false;
  nextStartTime = 0;
  if (currentSource) {
    try {
      currentSource.stop(0);
      currentSource.disconnect();
    } catch (_) {}
    currentSource = null;
  }
}

function getMicStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

/**
 * Captura el micrófono, convierte a PCM 16kHz 16-bit y envía chunks a la sesión.
 * Re-muestrea desde la tasa del contexto (p. ej. 48kHz) a 16kHz.
 */
function pipeMicToSession(
  stream: MediaStream,
  sendRealtimeInput: (params: { audio: { data: string; mimeType: string } }) => void
): () => void {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const frameLen = 2048;
  const processor = ctx.createScriptProcessor(frameLen, 1, 1);
  const outSampleRate = 16000;
  const ratio = ctx.sampleRate / outSampleRate;
  const outLen = Math.floor(frameLen / ratio);
  const outBuffer = new Int16Array(outLen);

  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    const input = e.inputBuffer.getChannelData(0);
    for (let i = 0; i < outLen; i++) {
      const srcIdx = i * ratio;
      const idx = Math.floor(srcIdx);
      const frac = srcIdx - idx;
      const s = idx + 1 < frameLen
        ? input[idx] * (1 - frac) + input[idx + 1] * frac
        : input[idx];
      const clamped = Math.max(-1, Math.min(1, s));
      outBuffer[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    }
    const bytes = new Uint8Array(outBuffer.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    sendRealtimeInput({
      audio: { data: btoa(binary), mimeType: "audio/pcm;rate=16000" },
    });
  };
  source.connect(processor);
  processor.connect(ctx.destination);
  return () => {
    processor.disconnect();
    source.disconnect();
    ctx.close();
  };
}

/** Tipo mínimo del mensaje del servidor (camelCase o snake_case) */
interface ServerMessage {
  serverContent?: {
    interrupted?: boolean;
    modelTurn?: {
      parts?: Array<{ inlineData?: { data?: string } }>;
    };
  };
}

export async function connectGeminiLive(callbacks: GeminiLiveCallbacks = {}): Promise<() => void> {
  const { onStatus, onError } = callbacks;
  if (!API_KEY) {
    onError?.("Falta VITE_GEMINI_API_KEY en .env");
    onStatus?.("error");
    return () => {};
  }

  onStatus?.("connecting");

  const ai = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: { apiVersion: "v1alpha" },
  });

  try {
    const session = await ai.live.connect({
      model: MODEL,
      config: LIVE_CONFIG,
      callbacks: {
        onopen: () => onStatus?.("connected"),
        onmessage: (raw: unknown) => {
          const msg = raw as ServerMessage;
          const content = msg?.serverContent;
          // VAD: usuario interrumpió; detener reproducción y vaciar cola (BidiGenerateContentServerContent.interrupted)
          if (content?.interrupted) {
            stopPlayback();
            return;
          }
          const parts = content?.modelTurn?.parts ?? [];
          for (const part of parts) {
            const data = part.inlineData?.data;
            if (data) playAudioChunk(data);
          }
        },
        onerror: (e: unknown) => {
          const message = (e as { message?: string })?.message ?? String(e);
          onError?.(message);
          onStatus?.("error");
        },
        onclose: () => onStatus?.("idle"),
      },
    });

    session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: "Hola" }] }],
      turnComplete: true,
    });

    const stream = await getMicStream();
    const stopMic = pipeMicToSession(stream, (params) => {
      session.sendRealtimeInput(params);
    });

    return () => {
      stopPlayback();
      stopMic();
      session.close();
      onStatus?.("idle");
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onError?.(message);
    onStatus?.("error");
    return () => {};
  }
}
