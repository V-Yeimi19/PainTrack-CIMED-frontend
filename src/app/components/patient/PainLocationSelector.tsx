import { useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { PainLocation } from '@/app/types';
import { BodyMap, CustomPoint } from './BodyMap';

// Mapeo de partes del cuerpo a sus imágenes
const bodyPartImages: Record<PainLocation, string> = {
  'Cabeza': '/images/cuerpo/hombre_front-removebg-preview.png',
  'Pecho': '/images/cuerpo/hombre_front-removebg-preview.png',
  'Estómago': '/images/cuerpo/hombre_front-removebg-preview.png',
  'Espalda': '/images/cuerpo/espalda.png',
  'Rodillas': '/images/cuerpo/rodilla derecha.png',
  'Brazos': '/images/cuerpo/hombre_front-removebg-preview.png',
  'Piernas': '/images/cuerpo/hombre_front-removebg-preview.png',
  'Otro': '/images/cuerpo/hombre_front-removebg-preview.png',
};

interface PainLocationSelectorProps {
  gender: 'hombre' | 'mujer' | 'Hombre' | 'Mujer';
  registeredLocations?: PainLocation[];
  customPoints?: CustomPoint[];
  treatedBodyParts?: PainLocation[]; // Partes tratadas en consulta (solo para nuevo registro)
  onSelect: (location: PainLocation, customPoints?: CustomPoint[]) => void;
  onCustomPointsChange?: (points: CustomPoint[]) => void;
  onBack: () => void;
  onFinish: () => void;
}

export function PainLocationSelector({ gender, registeredLocations = [], customPoints = [], treatedBodyParts, onSelect, onCustomPointsChange, onBack, onFinish }: PainLocationSelectorProps) {
  // Si es nuevo registro y hay partes tratadas, mostrar solo esas partes
  const showOnlyTreatedParts = treatedBodyParts && treatedBodyParts.length > 0;

  // Leer pregunta cuando aparece la pantalla
  // useEffect(() => {
  //   const question = showOnlyTreatedParts
  //     ? `Partes en tratamiento. Selecciona la parte del cuerpo donde sientes el dolor. Toca el botón de la parte que te duele.`
  //     : `¿Dónde te duele? Toca la zona de tu cuerpo donde sientes el dolor en el mapa.`;
  //   setTimeout(() => speakNatural(question), 100);
  // }, [showOnlyTreatedParts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-purple-900 text-center mb-3">
          {showOnlyTreatedParts ? 'Partes en tratamiento' : '¿Dónde te duele?'}
        </h1>
        <p className="text-2xl text-gray-700 text-center font-semibold">
          {showOnlyTreatedParts 
            ? 'Selecciona la parte del cuerpo donde sientes el dolor'
            : 'Toca la zona de tu cuerpo donde sientes el dolor'}
        </p>
        {registeredLocations.length > 0 && (
          <p className="text-xl text-purple-700 text-center mt-3 font-medium">
            {registeredLocations.length} dolor{registeredLocations.length > 1 ? 'es' : ''} registrado{registeredLocations.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {showOnlyTreatedParts ? (
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
              {treatedBodyParts.map((part) => {
                const partImage = bodyPartImages[part] || '/images/cuerpo/hombre_front-removebg-preview.png';
                return (
                  <Button
                    key={part}
                    onClick={() => onSelect(part)}
                    className="h-32 sm:h-36 text-xl sm:text-2xl font-semibold bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:to-[hsl(270,70%,40%)] text-white shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center gap-2 p-4 relative overflow-hidden"
                  >
                    {/* Imagen de fondo con opacidad */}
                    <div className="absolute inset-0 opacity-10">
                      <img 
                        src={partImage} 
                        alt={part}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Imagen principal */}
                    <img 
                      src={partImage} 
                      alt={part}
                      className="h-16 sm:h-20 w-auto object-contain opacity-90 relative z-10"
                    />
                    <span className="relative z-10">{part}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        ) : (
          <BodyMap 
            gender={gender} 
            registeredLocations={registeredLocations} 
            customPoints={customPoints}
            onSelect={onSelect}
            onCustomPointsChange={onCustomPointsChange}
          />
        )}
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
