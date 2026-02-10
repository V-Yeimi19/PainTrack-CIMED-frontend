import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Mic, MicOff, X } from 'lucide-react';
import type { ConnectionStatus } from '@/app/utils/geminiLive';

interface VoiceAssistantFabProps {
  assistantStatus: ConnectionStatus;
  assistantError: string | null;
  disconnectAssistant: (() => void) | null;
  onConnectAssistant: () => void;
}

export function VoiceAssistantFab({
  assistantStatus,
  assistantError,
  disconnectAssistant,
  onConnectAssistant,
}: VoiceAssistantFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(270,70%,50%)] text-white shadow-lg hover:bg-[hsl(270,70%,45%)] focus:outline-none focus:ring-2 focus:ring-[hsl(270,81%,56%)]"
        aria-label="Asistente de voz"
      >
        <Mic className="h-7 w-7" />
      </button>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-xl border-2 border-[hsl(270,81%,90%)] bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-bold text-[hsl(270,81%,40%)]">Asistente de voz</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-3 text-sm text-gray-600">
            Pregunta por la pantalla actual, cómo navegar o dudas del formulario.
          </p>
          {assistantError && (
            <Alert className="mb-3 border-amber-500 bg-amber-50">
              <AlertDescription className="text-xs text-amber-800">{assistantError}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={onConnectAssistant}
            disabled={assistantStatus === 'connecting'}
            className="w-full bg-[hsl(270,70%,50%)] hover:bg-[hsl(270,70%,45%)]"
          >
            {assistantStatus === 'connecting' && 'Conectando…'}
            {disconnectAssistant != null && assistantStatus === 'connected' && (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Desconectar
              </>
            )}
            {!disconnectAssistant && assistantStatus !== 'connecting' && (
              <>
                <Mic className="mr-2 h-4 w-4" />
                {assistantStatus === 'error' ? 'Reintentar' : 'Hablar con asistente'}
              </>
            )}
          </Button>
          {assistantStatus === 'connected' && (
            <p className="mt-2 text-xs font-medium text-green-700">Conectado. Habla ahora.</p>
          )}
        </div>
      )}
    </>
  );
}
