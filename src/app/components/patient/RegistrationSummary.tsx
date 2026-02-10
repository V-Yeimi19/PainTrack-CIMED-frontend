import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { PainLevel, PainLocation, PainType } from '@/app/types';
// import { speakNatural } from '@/app/utils/speech';

interface RegistrationSummaryProps {
  location: PainLocation;
  painLevel: PainLevel;
  types: PainType[];
  /** Si hay más partes en tratamiento (flujo médico). Sigue mostrándose siempre la opción de registrar otra parte. */
  hasMoreParts?: boolean;
  onContinue: () => void;
  onFinish: () => void;
}

export function RegistrationSummary({ 
  location, 
  painLevel, 
  types, 
  onContinue, 
  onFinish 
}: RegistrationSummaryProps) {
  // useEffect(() => {
  //   const text = `Registro completado. Ubicación: ${location}. Nivel de dolor: ${painLevelLabels[painLevel]}. Tipo: ${types.join(', ')}.`;
  //   speakNatural(text);
  // }, []);

  const painLevelLabels: Record<PainLevel, string> = {
    0: 'No me duele',
    2: 'Me duele un poco',
    4: 'Me duele, pero puedo hacer mis cosas',
    6: 'Me duele bastante',
    8: 'Me duele mucho',
    10: 'Es el peor dolor que he sentido'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-purple-100/50 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-[hsl(270,30%,40%)] text-center mb-3">
          Resumen del registro
        </h1>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
            {/* Ubicación */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3">
                Ubicación:
              </h2>
              <p className="text-3xl sm:text-4xl font-semibold text-[hsl(270,35%,50%)]">
                {location}
              </p>
            </div>

            {/* Nivel de dolor */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3">
                Nivel de dolor:
              </h2>
              <p className="text-3xl sm:text-4xl font-semibold text-[hsl(270,35%,50%)]">
                {painLevelLabels[painLevel]}
              </p>
            </div>

            {/* Tipo de dolor */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3">
                Tipo de dolor:
              </h2>
              <div className="flex flex-wrap gap-3">
                {types.map((type) => (
                  <span
                    key={type}
                    className="text-2xl sm:text-3xl font-semibold text-white bg-[hsl(270,45%,55%)] hover:bg-[hsl(270,45%,50%)] px-4 py-2 rounded-xl transition-colors"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Mensaje de confirmación */}
            <div className="mt-8 p-4 bg-[hsl(142,30%,92%)] rounded-xl border-2 border-[hsl(142,25%,75%)]">
              <p className="text-2xl sm:text-3xl font-semibold text-[hsl(142,35%,35%)] text-center">
                ✓ Registro guardado correctamente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botones fijos: siempre ofrecer registrar otra parte y finalizar */}
      <div className="bg-white shadow-lg px-6 py-4 space-y-3">
        <Button
          onClick={onContinue}
          className="w-full h-20 sm:h-24 text-xl sm:text-2xl font-bold bg-[hsl(270,45%,55%)] hover:bg-[hsl(270,45%,50%)] shadow-2xl text-white transition-colors"
        >
          Registrar dolor en otra parte del cuerpo
        </Button>
        <Button
          onClick={onFinish}
          className="w-full h-20 sm:h-24 text-xl sm:text-2xl font-bold bg-[hsl(142,45%,45%)] hover:bg-[hsl(142,45%,40%)] shadow-2xl text-white transition-colors"
        >
          Finalizar registro
        </Button>
      </div>
    </div>
  );
}
