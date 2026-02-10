import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import type { ConnectionStatus } from '@/app/utils/geminiLive';

interface AssistantIntroProps {
  /** Transcripción de lo que dice Gemini (para mostrar en esta pantalla). */
  transcription?: string | null;
  onContinue: () => void;
  /** Controles del asistente de voz: micrófono integrado en el círculo (no FAB en esquina). */
  assistantStatus: ConnectionStatus;
  assistantError: string | null;
  disconnectAssistant: (() => void) | null;
  onConnectAssistant: () => void;
}

const FADE_OUT_DURATION_MS = 1200;

export function AssistantIntro({
  transcription,
  onContinue,
  assistantStatus,
  assistantError,
  disconnectAssistant,
  onConnectAssistant,
}: AssistantIntroProps) {
  const isConnected = assistantStatus === 'connected';
  const isConnecting = assistantStatus === 'connecting';

  const [displayedText, setDisplayedText] = useState<string | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const fadeOutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (transcription != null && transcription !== '') {
      if (fadeOutTimeoutRef.current) {
        clearTimeout(fadeOutTimeoutRef.current);
        fadeOutTimeoutRef.current = null;
      }
      setDisplayedText(transcription);
      setIsFadingOut(false);
      return () => {
        if (fadeOutTimeoutRef.current) clearTimeout(fadeOutTimeoutRef.current);
      };
    }
    if (displayedText != null && displayedText !== '') {
      setIsFadingOut(true);
      fadeOutTimeoutRef.current = setTimeout(() => {
        fadeOutTimeoutRef.current = null;
        setDisplayedText(null);
        setIsFadingOut(false);
      }, FADE_OUT_DURATION_MS);
      return () => {
        if (fadeOutTimeoutRef.current) {
          clearTimeout(fadeOutTimeoutRef.current);
          fadeOutTimeoutRef.current = null;
        }
      };
    }
  }, [transcription]);

  useEffect(() => {
    if (transcription == null && !isFadingOut) setDisplayedText(null);
  }, [transcription, isFadingOut]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 pb-28">
      <div className="max-w-2xl w-full text-center">
        <p className="text-lg sm:text-xl font-semibold text-[hsl(270,50%,40%)] mb-4">
          Asistente CIMED
        </p>

        {/* Círculo morado con icono de micrófono: tocar = conectar/hablar (no hay botón en esquina) */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <button
            type="button"
            onClick={isConnected ? undefined : onConnectAssistant}
            disabled={isConnecting}
            className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full bg-[hsl(270,70%,55%)] shadow-[0_0_60px_rgba(147,51,234,0.5)] animate-assistant-pulse focus:outline-none focus:ring-4 focus:ring-[hsl(270,70%,75%)] disabled:opacity-70 cursor-pointer hover:bg-[hsl(270,70%,50%)] transition-colors"
            aria-label={isConnected ? 'Conectado, habla ahora' : isConnecting ? 'Conectando…' : 'Toca para hablar con el asistente'}
          >
            <div className="absolute inset-0 rounded-full bg-[hsl(270,70%,65%)] animate-assistant-glow opacity-60 pointer-events-none" />
            <div className="absolute inset-2 sm:inset-3 rounded-full bg-[hsl(270,70%,50%)] flex items-center justify-center pointer-events-none">
              <Mic className="h-16 w-16 sm:h-20 sm:w-20 text-white" aria-hidden />
            </div>
          </button>
        </div>

        {isConnecting && (
          <p className="text-base text-gray-600 mb-2">Conectando…</p>
        )}
        {isConnected && (
          <p className="text-base font-medium text-green-700 mb-2">Conectado. Habla ahora.</p>
        )}
        {!isConnected && !isConnecting && (
          <p className="text-base sm:text-lg text-gray-600 mb-2">
            Toca el micrófono para hablar con el asistente.
          </p>
        )}

        {assistantError && (
          <Alert className="mb-4 border-amber-500 bg-amber-50 text-left">
            <AlertDescription className="text-sm text-amber-800">{assistantError}</AlertDescription>
          </Alert>
        )}

        {isConnected && disconnectAssistant && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={disconnectAssistant}
            className="mb-4 border-[hsl(270,50%,70%)] text-[hsl(270,50%,35%)]"
          >
            <MicOff className="mr-2 h-4 w-4" />
            Desconectar
          </Button>
        )}

        {/* Mensaje del asistente */}
        <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-purple-900 leading-relaxed mb-6 px-2">
          Hoy conversaremos para obtener datos que le servirán al médico en tu consulta.
        </p>

        {/* Zona de transcripción: una frase, luego desvanece y queda el cuadro vacío para la siguiente */}
        {(displayedText != null && displayedText !== '') || isFadingOut ? (
          <div
            className={`mb-8 w-full rounded-2xl border-2 border-[hsl(270,50%,85%)] bg-white/90 backdrop-blur-sm px-5 py-4 shadow-lg text-left transition-opacity duration-[1200ms] ${
              isFadingOut ? 'opacity-0' : 'opacity-100 animate-transcription-in'
            }`}
          >
            <p className="text-lg sm:text-xl text-gray-800 leading-relaxed">{displayedText}</p>
          </div>
        ) : null}

        <Button
          onClick={onContinue}
          className="w-full h-14 sm:h-16 text-lg sm:text-xl font-bold bg-[hsl(270,70%,50%)] hover:bg-[hsl(270,70%,45%)] text-white shadow-xl"
        >
          Ir al inicio
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          Cuando termines de hablar con el asistente, toca aquí para volver.
        </p>
      </div>

      <style>{`
        @keyframes assistant-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(147,51,234,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 70px rgba(147,51,234,0.6); }
        }
        @keyframes assistant-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes transcription-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-assistant-pulse { animation: assistant-pulse 2.5s ease-in-out infinite; }
        .animate-assistant-glow { animation: assistant-glow 2.5s ease-in-out infinite; }
        .animate-transcription-in { animation: transcription-in 0.4s ease-out; }
      `}</style>
    </div>
  );
}
