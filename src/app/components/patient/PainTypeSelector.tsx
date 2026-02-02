import { Button } from '@/app/components/ui/button';
import { PainType } from '@/app/types';
import { Flame, Zap, CircleAlert, Frown, Clock, Repeat } from 'lucide-react';

interface PainTypeSelectorProps {
  onSelect: (type: PainType) => void;
  onBack: () => void;
}

const painTypes = [
  { type: 'Ardor' as PainType, icon: Flame, color: 'bg-orange-500', emoji: '🔥' },
  { type: 'Punzante' as PainType, icon: Zap, color: 'bg-yellow-500', emoji: '⚡' },
  { type: 'Fuerte' as PainType, icon: CircleAlert, color: 'bg-red-500', emoji: '💥' },
  { type: 'Molesto' as PainType, icon: Frown, color: 'bg-purple-500', emoji: '😣' },
  { type: 'Constante' as PainType, icon: Clock, color: 'bg-blue-500', emoji: '😴' },
  { type: 'Intermitente' as PainType, icon: Repeat, color: 'bg-teal-500', emoji: '🔄' },
];

export function PainTypeSelector({ onSelect, onBack }: PainTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-orange-900 text-center mb-3">
          ¿Cómo es tu dolor?
        </h1>
        <p className="text-xl text-gray-700 text-center">
          Selecciona el tipo que mejor lo describe
        </p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          {painTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`${item.color} hover:scale-105 active:scale-95 transition-transform p-8 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 min-h-[180px]`}
              >
                <div className="text-6xl">{item.emoji}</div>
                <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                <div className="text-white font-bold text-2xl">
                  {item.type}
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
