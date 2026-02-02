import { Button } from '@/app/components/ui/button';
import { PainLocation } from '@/app/types';
import { Brain, ArrowBigUp, Moon, Heart, Pizza, Dumbbell, Footprints, HelpCircle } from 'lucide-react';

interface PainLocationSelectorProps {
  onSelect: (location: PainLocation) => void;
  onBack: () => void;
}

const locations = [
  { location: 'Cabeza' as PainLocation, icon: Brain, color: 'bg-purple-500' },
  { location: 'Espalda' as PainLocation, icon: ArrowBigUp, color: 'bg-blue-500' },
  { location: 'Rodillas' as PainLocation, icon: Moon, color: 'bg-green-500' },
  { location: 'Pecho' as PainLocation, icon: Heart, color: 'bg-red-500' },
  { location: 'Estómago' as PainLocation, icon: Pizza, color: 'bg-orange-500' },
  { location: 'Brazos' as PainLocation, icon: Dumbbell, color: 'bg-teal-500' },
  { location: 'Piernas' as PainLocation, icon: Footprints, color: 'bg-indigo-500' },
  { location: 'Otro' as PainLocation, icon: HelpCircle, color: 'bg-gray-500' },
];

export function PainLocationSelector({ onSelect, onBack }: PainLocationSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-purple-900 text-center mb-3">
          ¿Dónde te duele?
        </h1>
        <p className="text-xl text-gray-700 text-center">
          Selecciona la zona de tu cuerpo
        </p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          {locations.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.location}
                onClick={() => onSelect(item.location)}
                className={`${item.color} hover:scale-105 active:scale-95 transition-transform p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-4 min-h-[180px]`}
              >
                <Icon className="w-16 h-16 text-white" strokeWidth={2} />
                <div className="text-white font-bold text-2xl text-center">
                  {item.location}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Botón atrás fijo */}
      <div className="bg-white shadow-lg px-6 py-4">
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
