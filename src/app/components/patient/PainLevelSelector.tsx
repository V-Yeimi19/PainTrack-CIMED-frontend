import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { PainLevel } from '@/app/types';
import { speakNatural } from '@/app/utils/speech';

interface PainLevelSelectorProps {
  onSelect: (level: PainLevel) => void;
  onBack: () => void;
}

// Opciones de dolor según especificación del usuario
const painLevels = [
  { level: 0, emoji: '😊', label: 'No me duele', color: 'bg-green-500' },
  { level: 2, emoji: '🙂', label: 'Me duele un poco', color: 'bg-green-400' },
  { level: 4, emoji: '😐', label: 'Me duele, pero puedo hacer mis cosas', color: 'bg-yellow-500' },
  { level: 6, emoji: '😣', label: 'Me duele bastante', color: 'bg-orange-500' },
  { level: 8, emoji: '😖', label: 'Me duele mucho', color: 'bg-red-500' },
  { level: 10, emoji: '😫', label: 'Es el peor dolor que he sentido', color: 'bg-red-600' },
];

export function PainLevelSelector({ onSelect, onBack }: PainLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<PainLevel | null>(null);

  // Leer pregunta cuando aparece la pantalla
  useEffect(() => {
    const question = `¿Cuánto te duele hoy? Selecciona una opción según cómo te sientes: No me duele, Me duele un poco, Me duele pero puedo hacer mis cosas, Me duele bastante, Me duele mucho, o Es el peor dolor que he sentido.`;
    setTimeout(() => speakNatural(question), 100);
  }, []);

  const handleConfirm = () => {
    if (selectedLevel !== null) {
      onSelect(selectedLevel);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 text-center mb-3">
          ¿Cuánto te duele hoy?
        </h1>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center">
            {/* Botones de opciones de dolor */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl">
              <div className="space-y-4 sm:space-y-5">
                {painLevels.map((option) => {
                  const isSelected = selectedLevel === option.level;
                  
                  // Colores más suaves cuando no está seleccionado, más vibrantes cuando está seleccionado
                  const unselectedColors: Record<number, string> = {
                    0: 'bg-green-100',
                    2: 'bg-green-50',
                    4: 'bg-yellow-50',
                    6: 'bg-orange-50',
                    8: 'bg-red-50',
                    10: 'bg-pink-50'
                  };
                  
                  const selectedColors: Record<number, string> = {
                    0: 'bg-green-500',
                    2: 'bg-green-400',
                    4: 'bg-yellow-500',
                    6: 'bg-orange-500',
                    8: 'bg-red-500',
                    10: 'bg-red-600'
                  };
                  
                  return (
                    <button
                      key={option.level}
                      onClick={() => {
                        // Actualizar estado primero para feedback visual inmediato
                        setSelectedLevel(option.level as PainLevel);
                        // Reproducir audio después (no bloquea la UI)
                        setTimeout(() => speakNatural(option.label), 0);
                      }}
                      className={`w-full flex items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl transition-all duration-100 active:scale-[0.98] ${
                        isSelected 
                          ? `${selectedColors[option.level]} text-white shadow-xl scale-[1.02]` 
                          : `${unselectedColors[option.level]} text-gray-800 hover:shadow-lg hover:scale-[1.01]`
                      }`}
                    >
                      <span className="text-4xl sm:text-5xl lg:text-6xl flex-shrink-0">
                        {option.emoji}
                      </span>
                      <div className="flex-1 text-left">
                        <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${
                          isSelected ? 'text-white' : 'text-gray-800'
                        }`}>
                          {option.label}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones fijos */}
      <div className="bg-white shadow-lg px-4 sm:px-6 py-4 space-y-3">
        <Button
          onClick={handleConfirm}
          disabled={selectedLevel === null}
          className="w-full h-16 sm:h-20 text-xl sm:text-2xl lg:text-3xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          CONTINUAR
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full h-14 sm:h-16 text-lg sm:text-xl lg:text-2xl font-bold"
        >
          ATRÁS
        </Button>
      </div>

    </div>
  );
}
