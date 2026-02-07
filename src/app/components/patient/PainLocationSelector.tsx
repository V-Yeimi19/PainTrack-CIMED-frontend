import { Button } from '@/app/components/ui/button';
import { PainLocation } from '@/app/types';
import { BodyMap, CustomPoint } from './BodyMap';

interface PainLocationSelectorProps {
  gender: 'hombre' | 'mujer' | 'Hombre' | 'Mujer';
  registeredLocations?: PainLocation[];
  customPoints?: CustomPoint[];
  onSelect: (location: PainLocation, customPoints?: CustomPoint[]) => void;
  onCustomPointsChange?: (points: CustomPoint[]) => void;
  onBack: () => void;
  onFinish: () => void;
}

export function PainLocationSelector({ gender, registeredLocations = [], customPoints = [], onSelect, onCustomPointsChange, onBack, onFinish }: PainLocationSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-purple-900 text-center mb-3">
          ¿Dónde te duele?
        </h1>
        <p className="text-2xl text-gray-700 text-center font-semibold">
          Toca la zona de tu cuerpo donde sientes el dolor
        </p>
        {registeredLocations.length > 0 && (
          <p className="text-xl text-purple-700 text-center mt-3 font-medium">
            {registeredLocations.length} dolor{registeredLocations.length > 1 ? 'es' : ''} registrado{registeredLocations.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <BodyMap 
          gender={gender} 
          registeredLocations={registeredLocations} 
          customPoints={customPoints}
          onSelect={onSelect}
          onCustomPointsChange={onCustomPointsChange}
        />
      </div>

      {/* Botones fijos */}
      <div className="bg-white shadow-lg px-6 py-4 space-y-3">
        {registeredLocations.length > 0 && (
          <Button
            onClick={onFinish}
            className="w-full h-20 text-2xl font-bold bg-green-600 hover:bg-green-700 shadow-xl"
          >
            FINALIZAR REGISTRO
          </Button>
        )}
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full h-20 text-2xl font-bold"
        >
          ATRÁS
        </Button>
      </div>
    </div>
  );
}
