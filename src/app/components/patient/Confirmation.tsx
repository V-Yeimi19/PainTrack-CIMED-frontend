import { Button } from '@/app/components/ui/button';
import { PainLevel, PainLocation, PainType } from '@/app/types';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationProps {
  painLevel: PainLevel;
  location: PainLocation;
  types: PainType[];
  comment?: string;
  onSave: () => void;
  onExit: () => void;
}

const painTypeEmojis: Record<PainType, string> = {
  'Punzante': '🔪',
  'Ardor': '🔥',
  'Presión': '🪨',
  'Eléctrico': '⚡',
  'Hormigueo': '🐜',
  'General': '😖',
};

export function Confirmation({ painLevel, location, types, comment, onSave, onExit }: ConfirmationProps) {
  const now = new Date();
  const formattedDate = now.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getPainEmoji = (level: PainLevel) => {
    if (level <= 2) return '😊';
    if (level <= 5) return '🙂';
    if (level <= 7) return '😣';
    return '😫';
  };

  const getPainColor = (level: PainLevel) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 5) return 'text-yellow-600';
    if (level <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Icono de confirmación */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-24 h-24 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-4 leading-tight">
            Registro guardado correctamente
          </h1>
          <p className="text-xl text-green-700 mb-8">
            Puedes agregar más dolores si lo necesitas
          </p>
        </div>

        {/* Resumen del registro */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-2xl max-w-md mx-auto w-full">
          <div className="text-center pb-6 border-b-2 mb-6">
            <p className="text-xl text-gray-600 mb-3">Fecha y hora</p>
            <p className="text-2xl font-bold text-gray-800">{formattedDate}</p>
            <p className="text-2xl font-bold text-gray-800">{formattedTime}</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-2xl text-center">
              <p className="text-lg text-gray-600 mb-2">Nivel de dolor</p>
              <div className="text-6xl mb-2">{getPainEmoji(painLevel)}</div>
              <p className={`text-3xl font-bold ${getPainColor(painLevel)}`}>
                {painLevel <= 2 ? 'No me duele' :
                 painLevel <= 5 ? 'Me duele un poco' :
                 painLevel <= 7 ? 'Me duele bastante' :
                 'Me duele mucho'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-2xl text-center">
              <p className="text-lg text-gray-600 mb-2">Ubicación</p>
              <p className="text-3xl font-bold text-purple-700">{location}</p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-2xl">
              <p className="text-lg text-gray-600 mb-3 text-center">Tipo{types.length > 1 ? 's' : ''} de dolor</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {types.map((type, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
                  >
                    <span className="text-2xl">{painTypeEmojis[type]}</span>
                    <span className="text-xl font-bold text-orange-700">{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {comment && (
              <div className="bg-teal-50 p-6 rounded-2xl">
                <p className="text-lg text-gray-600 mb-2">Comentario</p>
                <p className="text-xl font-semibold text-teal-700">{comment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-4 max-w-md mx-auto w-full">
          <Button
            onClick={onSave}
            className="w-full h-24 text-xl font-bold bg-green-600 hover:bg-green-700 shadow-xl"
          >
            CONTINUAR AGREGANDO DOLORES
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="w-full h-20 text-2xl font-bold"
          >
            FINALIZAR REGISTRO
          </Button>
        </div>
      </div>
    </div>
  );
}
