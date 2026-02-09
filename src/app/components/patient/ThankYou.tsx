import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { speakNatural } from '@/app/utils/speech';

interface ThankYouProps {
  onContinue: () => void;
  onFinish: () => void;
  hasMoreParts?: boolean;
}

export function ThankYou({ onContinue, onFinish, hasMoreParts = true }: ThankYouProps) {
  // Leer el mensaje en voz alta cuando se muestra
  useEffect(() => {
    speakNatural('¡Muchas gracias por contarnos cómo te sientes hoy!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        {/* Mensaje principal - MUY GRANDE para adultos mayores */}
        <div className="mb-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-green-700 mb-6">
            ¡Muchas gracias por contarnos cómo te sientes hoy!
          </h1>
          <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">
            🙏
          </div>
        </div>

        {/* Botones grandes y claros */}
        <div className="space-y-4 mt-12">
          {hasMoreParts ? (
            <Button
              onClick={onContinue}
              className="w-full h-24 sm:h-28 text-3xl sm:text-4xl font-bold bg-green-600 hover:bg-green-700 shadow-2xl text-white"
            >
              REGISTRAR OTRA PARTE
            </Button>
          ) : (
            <Button
              onClick={onFinish}
              className="w-full h-24 sm:h-28 text-3xl sm:text-4xl font-bold bg-green-600 hover:bg-green-700 shadow-2xl text-white"
            >
              FINALIZAR
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
