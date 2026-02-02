import { Button } from '@/app/components/ui/button';
import { PainLevel } from '@/app/types';

interface PainLevelSelectorProps {
  onSelect: (level: PainLevel) => void;
  onBack: () => void;
}

const painLevels = [
  { level: 0, emoji: '😊', label: 'Sin dolor', color: 'bg-green-500' },
  { level: 1, emoji: '🙂', label: 'Muy leve', color: 'bg-green-400' },
  { level: 2, emoji: '😌', label: 'Leve', color: 'bg-green-300' },
  { level: 3, emoji: '😐', label: 'Molesto', color: 'bg-yellow-400' },
  { level: 4, emoji: '😕', label: 'Incómodo', color: 'bg-yellow-500' },
  { level: 5, emoji: '😟', label: 'Moderado', color: 'bg-yellow-600' },
  { level: 6, emoji: '😣', label: 'Doloroso', color: 'bg-orange-400' },
  { level: 7, emoji: '😖', label: 'Muy doloroso', color: 'bg-orange-500' },
  { level: 8, emoji: '😫', label: 'Intenso', color: 'bg-orange-600' },
  { level: 9, emoji: '😭', label: 'Muy intenso', color: 'bg-red-500' },
  { level: 10, emoji: '😱', label: 'Insoportable', color: 'bg-red-600' },
];

export function PainLevelSelector({ onSelect, onBack }: PainLevelSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-3">
          ¿Cómo te sientes hoy?
        </h1>
        <p className="text-2xl text-gray-700 font-semibold text-center">
          Toca la carita que mejor represente tu dolor
        </p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
          {painLevels.map((item) => (
            <button
              key={item.level}
              onClick={() => onSelect(item.level as PainLevel)}
              className={`${item.color} hover:scale-105 active:scale-95 transition-transform p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center gap-3 min-h-[160px]`}
            >
              <div className="text-6xl">{item.emoji}</div>
              <div className="text-white font-bold text-3xl">{item.level}</div>
              <div className="text-white font-semibold text-xl">{item.label}</div>
            </button>
          ))}
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
