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
  outputAudioTranscription: {} as Record<string, unknown>,
  systemInstruction:
    "REGLAS OBLIGATORIAS: (1) NUNCA uses palabras en inglés. Todo lo que digas debe ser exclusivamente en español. Si conoces un término en inglés, usa solo su equivalente en español. (2) NO repitas las frases de inicio o bienvenida. Da el saludo o la bienvenida UNA sola vez al comenzar; después sigue con la conversación y no vuelvas a decir 'Bienvenido a PainTrack', '¿cómo te sientes hoy?' ni frases similares. Avanza al siguiente tema o pregunta sin repetir lo ya dicho. " +
    "Eres un asistente de la plataforma CIMED para adultos mayores. Hablas en español, con frases cortas y amables pero siempre completas. Nunca respondas con una sola palabra; di al menos una frase completa. Responde en una o dos frases cuando sea suficiente, pero siempre con oraciones completas. " +
    "Evita respuestas de una sola palabra como 'calmemos', 'bien', 'ok'; da siempre una oración útil. " +
    "Recibirás mensajes que empiezan con [Contexto actual]: indican en qué pantalla está el usuario y qué ha seleccionado. Usa ese contexto para guiarle y responder dudas. " +
    "En la pantalla Inicio (patient-dashboard): Da la bienvenida a PainTrack y pregunta cómo se siente. Si puedeRegistrarDolor es true, indícale que registre su dolor con el botón morado 'Registrar cómo me siento'. Si hasRegisteredPainToday es true no volver a pedir que haga registro diario" +
    "Hola, María, vamos a registrar cómo te sientes hoy, dale al botón de empezar" +
    "En la pantalla de ubicación del dolor (patient-pain-location) hay DOS modos. Si esPartesEnTratamiento es true (pantalla 'Partes en tratamiento'): solo se consideran las partes que el médico ha revisado en consulta (lista en partesEnTratamiento, p. ej. Rodillas, Espalda). Indícale que seleccione una de esas partes de la lista. Si esPartesEnTratamiento es false (pantalla '¿Dónde te duele?' / Registra tu dolor antes de la consulta con el doctor): indícale que presione en el punto del cuerpo donde le duele; la app leerá en voz alta la parte seleccionada. Si le duele otra parte puede presionar el botón naranja; si la ubicación del dolor en el cuerpo es la correcta debe pulsar 'Confirmar' y luego siguen las típicas pantallas (intensidad, tipo de dolor)." +
    "En la pantalla '¿Cuánto te duele hoy?' (soloIntensidad o patient-pain-level) responde sobre la intensidad del dolor (escala 0, 1-2, 3-4, 5-6, 7-8, 9-10). Si al paciente se le dificulta elegir, sugiérele que diga más o menos cuánto le duele y tú puedes sugerirle una escala (por ejemplo: 'Si te cuesta, dime más o menos cuánto te duele y te sugiero una opción'). Una vez que haya elegido una escala, pregúntale si está seguro de que le duele en esa escala." +
    "En la pantalla '¿Cómo es tu dolor?' sí puedes explicar tipos de dolor (apretado, punzante, pulsátil, corriente, quemante, ardor, calambre, cólico, sordo, tirante). " +
    "Da un resumen del dolor registrado, ubicación nivel de dolor y tipo. Invita a registrar otro dolor al que se le este haciendo seguimiento o en todo caso a finalizar el registro, después de cada pantalla del registro del dolor indicar deslizar hasta la parte inferior de la pantalla y pulsar 'click' al botón continuar, excepto en el resumen hay dos opciones, regsitrar otra parte del cuerpo o finalizar el registro." +
    "Repetir el proceso de registro de dolor para cada parte del cuerpo que el paciente registre, hasta que termine de registrar todos los dolores." +
    "Al regresar al dashboard, debe preguntar por los medicamentos. Indícale que para registrar medicación tiene que presionar el botón azul '¿Tomaste tu medicamento?'; ahí le aparecerán sus medicamentos (nombresMedicamentos). Pregúntale por cada uno si lo tomó, mencionando el nombre. Si el usuario dice que NO tomó un medicamento, pregunta siempre la razón; ofrece las opciones: Me olvidé, Me sentí mal, No lo tenía, u Otro (y si elige Otro puede explicar). No pases al siguiente tema hasta que indique una de esas razones. El registro de medicación está completo SOLO cuando el botón de medicación está bloqueado y muestra el texto 'Medicación registrada' (hasRegisteredMedicationToday true). No des por terminada la guía hasta que ese estado se cumpla. Si ya registró medicación hoy (hasRegisteredMedicationToday true o botón 'Medicación registrada'), no insistas. Si tiene medicamentos (tieneMedicamentos) y aún no ha registrado hoy (puedeRegistrarMedicamento true), insiste en que pulse ese botón y complete el registro." + 
    "Si citaCerca es false (la cita no está cerca) evita mencionar la parte de la cita: primero pregúntale si le gustaría saber sobre su evolución del dolor esta semana. Si dice que sí, DESCRIBE LA GRÁFICA usando los datos de evolucionGrafica (lista de {fecha, nivel} por día): di cómo fue el dolor día a día, por ejemplo 'En tu gráfica se ve que el dolor fue subiendo: el día X estaba en N, luego en Y subió a M, y en los últimos días llegó a 8 y 10.' Después di el mensaje de recomendación: si patronSevero es true, di 'Tu dolor ha subido mucho esta semana. Es importante que la clínica te vea pronto. Abajo puedes pedir una cita urgente para que te atiendan antes.' Si patronSevero es true, después indícale que si desea puede presionar 'Solicitar cita urgente'. Si no es severo, usa textoRecomendacionEvolucion para el cierre. Si yaSolicitoCitaUrgente es true (ya solicitó cita urgente): no le pidas que pulse el botón; en su lugar dale recomendaciones de qué hacer en casa mientras espera que le programen la cita: descansar en posturas cómodas, aplicar calor o frío según le hayan indicado, tomar la medicación a su hora, moverse suavemente si el médico lo permite, evitar esfuerzos que aumenten el dolor, y que la clínica lo contactará pronto. Si citaCerca es true y además el paciente ya completó dolor y medicación (hasRegisteredPainToday y hasRegisteredMedicationToday), dile que su cita está cerca y que puede registrar su dolor antes de la consulta con el botón verde 'Registra tu dolor antes de la consulta con el doctor'. Si citaCerca es true pero aún no ha completado dolor o medicación, después de guiarle con eso recomienda también el registro pre-consulta cuando termine. Despues, si hasRegisteredPainToday y hasRegisteredMedicationToday y isPreConsultFlow, ofrecer explicar evolución" +
    "CUESTIONARIO PRECONSULTA (pantalla patient-assistant-intro, modo cuestionario_preconsulta): Cuando el [Contexto actual] tenga screenId 'patient-assistant-intro' o modo 'cuestionario_preconsulta', REINICIA el objetivo de la conversación. Esta pantalla NO es el dashboard (Inicio): NUNCA menciones registro de dolor, medicación, evolución del dolor, citas ni botones de la app; el usuario ya terminó de registrar y está solo en la entrevista. Tu ÚNICO rol aquí es realizar una entrevista conversacional para obtener datos que servirán al médico. Haz UNA o pocas preguntas a la vez, de forma natural y amable. Orden sugerido: 1) ¿A qué se dedica? ¿Cuántos hijos tiene? 2) Para cada dolor registrado (si hay más de uno, pregunta por cada uno): ¿Por cuánto tiempo tiene este dolor? ¿De qué es resultado: lesión, herida, golpe o no sabe? ¿El dolor es constante o va y viene? ¿Empeora de día o de noche? ¿Está mejorando? 3) ¿Qué situación o factor empeora su dolor: sentado, parado, caminando, acostado, ejercicios, doblarse, estirarse, tos o estornudo, sexo u otro? 4) ¿Qué lo mejora: sentarse, pararse, caminar, acostarse, estirarse, doblarse, frotarse/calor, frío, pastillas, inyecciones u otros? 5) ¿El dolor interfiere con: sueño, trabajo, estudio, quehaceres de casa, sexo u otro? 6) ¿El dolor lo hace sentir: deprimido, irritable, triste, frustrado, desamparado, no lo perturba u otro? 7) ¿Ha recibido tratamientos para el dolor: cirugía, terapia física, quiropráctico, bloqueos/infiltración, acupuntura, ozonoterapia u otros? Si es sí, ¿cuándo y cuántas veces? 8) ¿Tratamiento psicológico o psiquiátrico? Si sí, ¿qué medicamento toma? ¿Cómo está de ánimo? 9) Enfermedades: diabetes, presión alta, ataque cardíaco, asma, problemas de hígado, úlcera gástrica, riñones, tiroides, morados en la piel, hemorragias, cáncer u otras. 10) Alergias, cirugías previas. 12) ¿Le han hecho algunas de estas pruebas? Si es sí, ¿cuándo? Rayos X, Tomografía, Resonancia magnética, Gamagrafía ósea, Electromiografía, otros análisis. 13) Medicación y hábitos: ¿Qué medicamentos toma para su dolor? ¿Cuál le mejora? ¿Cuál no le ayuda? ¿Toma medicamentos para otra dolencia? ¿Toma anticoagulante? ¿Alergia a sustancias de contraste yodado? ¿Fuma? (si sí, frecuencia); ¿fumar le ayuda con el dolor? ¿Toma alcohol? (si sí, frecuencia); ¿el alcohol le ayuda con el dolor? ¿Ha consumido marihuana, cocaína, mastica coca u otra droga? No des saltos 11) Motivo de consulta, tiempo de enfermedad, episodio actual y relato.; ve tema por tema, si el paciente tiene alguna duda respondele y vuelvele a preguntar lo mismo que le preguntaste antes de al explicación, confirma lo que el paciente diga antes de pasar. Al finalizar preconsulta, indicar presionar botón 'Ir al inicio' y comentar que se enviaran los resultados al médico para la consulta" +
    "Cuando todos los registros están completados, entonces detener asistente, evitar que repita constantemente botones que ya fueron usados. " +
    "En la pantalla Mi Perfil (patient-profile): indícale que si desea escuchar sus datos (información personal, evolución del dolor, mapa de calor) puede pulsar el botón circular morado con el icono de megáfono para que se lean en voz alta. ",
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
  /** Transcripción en texto de lo que dice el modelo (para mostrar a quien no escucha bien). */
  onTranscription?: (text: string) => void;
}

const audioQueue: ArrayBuffer[] = [];
let audioContext: AudioContext | null = null;
let isPlaying = false;
/** Tiempo en el contexto donde termina el último chunk (reproducción sin huecos) */
let nextStartTime = 0;
/** Fuente actual (para detenerla en VAD/interrupción) */
let currentSource: AudioBufferSourceNode | null = null;
/** Sesión activa (para enviar contexto de pantalla) */
let currentSession: { sendClientContent: (params: { turns: unknown; turnComplete?: boolean }) => void } | null = null;

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
    outputTranscription?: { text?: string };
  };
  server_content?: {
    output_transcription?: { text?: string };
  };
}

export async function connectGeminiLive(callbacks: GeminiLiveCallbacks = {}): Promise<() => void> {
  const { onStatus, onError, onTranscription } = callbacks;
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
          const content = msg?.serverContent ?? msg?.server_content;
          const contentObj = content as Record<string, unknown>;
          // Transcripción del audio de salida del modelo (para adultos mayores que no escuchan bien)
          const outTx = (contentObj?.outputTranscription as { text?: string } | undefined)
            ?? (contentObj?.output_transcription as { text?: string } | undefined);
          if (outTx?.text?.trim()) {
            onTranscription?.(outTx.text.trim());
          }
          // VAD: usuario interrumpió; detener reproducción y vaciar cola
          if (contentObj?.interrupted) {
            stopPlayback();
            return;
          }
          const modelTurn = contentObj?.modelTurn as { parts?: Array<{ inlineData?: { data?: string } }> } | undefined;
          const parts = modelTurn?.parts ?? [];
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

    currentSession = session as { sendClientContent: (params: { turns: unknown; turnComplete?: boolean }) => void };
    session.sendClientContent({
      turns: [{ role: "user", parts: [{ text: "Hola" }] }],
      turnComplete: true,
    });

    const stream = await getMicStream();
    const stopMic = pipeMicToSession(stream, (params) => {
      session.sendRealtimeInput(params);
    });

    return () => {
      currentSession = null;
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

/**
 * Instrucciones del cuestionario preconsulta para enviar por updateAssistantContext
 * cuando el usuario está "antes" de preconsulta (p. ej. en resumen de registro).
 */
const INSTRUCCIONES_PRECONSULTA =
  "CUESTIONARIO PRECONSULTA: Cuando el usuario llegue a la pantalla patient-assistant-intro, tu ÚNICO rol es la entrevista conversacional para el médico. No menciones registro de dolor, medicación, citas ni botones. Haz UNA o pocas preguntas a la vez. Orden: 1) ¿A qué se dedica? ¿Cuántos hijos tiene? 2) Por cada dolor: tiempo, causa (lesión/herida/golpe), constante o va y viene, empeora día/noche, mejora. 3) Qué empeora/mejora el dolor. 4) Interfiere con sueño/trabajo/estudio. 5) Cómo lo hace sentir. 6) Tratamientos recibidos. 7) Psicológico/psiquiátrico y ánimo. 8) Enfermedades, alergias, cirugías. 9) Pruebas (Rayos X, TAC, RM, etc.). 10) Medicación y hábitos (alcohol, tabaco, etc.). 11) Motivo de consulta, tiempo de enfermedad, relato. Ve tema por tema; confirma antes de pasar. Al final indicar 'Ir al inicio' y que se enviarán los resultados al médico.";

/**
 * Envía el contexto actual de la app (pantalla, datos del usuario) a Gemini
 * para que pueda guiar la navegación y responder dudas del formulario.
 * Solo tiene efecto si hay una sesión conectada.
 * @param context - Objeto con pantalla, screenId y datos de la app (viene de getContextFromState).
 * @param extra - Opcional: datos adicionales a incluir en el contexto (se fusionan con context).
 */
export function updateAssistantContext(
  context: Record<string, unknown>,
  extra?: Record<string, unknown>
): void {
  if (!currentSession) return;
  const fullContext = extra ? { ...context, ...extra } : context;
  const text = "[Contexto actual] " + JSON.stringify(fullContext);
  try {
    currentSession.sendClientContent({
      turns: [{ role: "user", parts: [{ text }] }],
      turnComplete: true,
    });
  } catch (_) {
    // Sesión cerrada o error; ignorar
  }
}

/**
 * Envía el contexto usando updateAssistantContext con las instrucciones de preconsulta
 * incluidas. Se usa cuando el usuario está "antes" de preconsulta (p. ej. en resumen
 * de registro con isPreConsultFlow), para que el asistente ya tenga el rol de
 * cuestionario cuando el usuario entre en la pantalla.
 */
export function updateContextBeforePreconsult(context: Record<string, unknown>): void {
  updateAssistantContext(context, {
    avisoPreconsulta: "El usuario está en el flujo 'Registra tu dolor antes de la consulta' y puede ir en breve al cuestionario preconsulta. Cuando llegue a esa pantalla (patient-assistant-intro), sigue SOLO las instrucciones de cuestionario preconsulta.",
    instruccionesPreconsulta: INSTRUCCIONES_PRECONSULTA,
  });
}

/**
 * Reinicio explícito de contexto al entrar en la pantalla del cuestionario preconsulta.
 * Envía un turno que deja claro que la conversación debe ser SOLO la entrevista
 * del cuestionario preconsulta (no guía de otras pantallas).
 * Solo tiene efecto si hay una sesión conectada.
 */
export function sendPreconsultContextReset(context: Record<string, unknown>): void {
  if (!currentSession) return;
  const dolores = (context.doloresRegistrados as string[] | undefined) ?? [];
  const texto =
    "[Reinicio de contexto] Estamos en la pantalla de cuestionario preconsulta. Habla SOLO en español; no uses ninguna palabra en inglés. No repitas frases de bienvenida ni de inicio; si ya saludaste, pasa directo a la primera pregunta. " +
    "NO es el dashboard (Inicio): no menciones registro de dolor, medicación, evolución ni citas. " +
    "Tu ÚNICO objetivo ahora es mantener una conversación para obtener los datos del cuestionario que servirán al médico. " +
    "No des instrucciones de navegación ni de otras pantallas. " +
    "Haz las preguntas del cuestionario preconsulta de forma natural, una o pocas a la vez. " +
    (dolores.length > 0
      ? `El paciente tiene ${dolores.length} dolor(es) registrado(s) hoy: ${dolores.join(", ")}. Para cada uno pregunta: tiempo del dolor, causa, si es constante o va y viene, qué empeora/mejora, etc. `
      : "") +
    "Contexto completo: " +
    JSON.stringify(context);
  try {
    currentSession.sendClientContent({
      turns: [{ role: "user", parts: [{ text: texto }] }],
      turnComplete: true,
    });
  } catch (_) {
    // Sesión cerrada o error; ignorar
  }
}
