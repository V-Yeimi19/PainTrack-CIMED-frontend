import { Button } from '@/app/components/ui/button';
import { PainLevel, PainLocation, PainType } from '@/app/types';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationProps {
  painLevel: PainLevel;
  location: PainLocation;
  type: PainType;
  onSave: () => void;
  onExit: () => void;
}

export function Confirmation({ painLevel, location, type, onSave, onExit }: ConfirmationProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Icono de confirmación */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="w-24 h-24 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-8 leading-tight">
            Registro guardado correctamente
          </h1>
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
              <p className="text-5xl font-bold text-blue-700">{painLevel}</p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-2xl text-center">
              <p className="text-lg text-gray-600 mb-2">Ubicación</p>
              <p className="text-3xl font-bold text-purple-700">{location}</p>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-2xl text-center">
              <p className="text-lg text-gray-600 mb-2">Tipo</p>
              <p className="text-3xl font-bold text-orange-700">{type}</p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="space-y-4 max-w-md mx-auto w-full">
          <Button
            onClick={onSave}
            className="w-full h-24 text-3xl font-bold bg-green-600 hover:bg-green-700 shadow-xl"
          >
            GUARDAR
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="w-full h-20 text-2xl font-bold"
          >
            SALIR
          </Button>
        </div>
      </div>
    </div>
  );
}
