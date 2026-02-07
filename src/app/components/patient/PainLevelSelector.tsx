import { useState, useRef, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { PainLevel } from '@/app/types';

interface PainLevelSelectorProps {
  onSelect: (level: PainLevel) => void;
  onBack: () => void;
}

// Función para leer texto en voz alta
const speakText = (text: string, lang: string = 'es-ES') => {
  // Verificar si el navegador soporta speechSynthesis
  if ('speechSynthesis' in window) {
    // Cancelar cualquier síntesis anterior
    window.speechSynthesis.cancel();
    
    // Esperar un momento para que el navegador esté listo
    setTimeout(() => {
      // Crear una nueva instancia de SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Parámetros más naturales
      utterance.rate = 0.85; // Velocidad ligeramente más lenta para sonar más natural
      utterance.pitch = 1.1; // Tono ligeramente más alto (más natural)
      utterance.volume = 1; // Volumen máximo
      
      // Intentar seleccionar una voz femenina en español (suele sonar más natural)
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.startsWith('es') && 
        (voice.name.includes('Female') || voice.name.includes('Mujer') || voice.name.includes('Femenina'))
      ) || voices.find(voice => voice.lang.startsWith('es'));
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      
      // Agregar eventos para mejorar la experiencia
      utterance.onstart = () => {
        console.log('Audio iniciado:', text);
      };
      
      utterance.onerror = (event) => {
        console.warn('Error en audio:', event);
      };
      
      // Reproducir el audio
      window.speechSynthesis.speak(utterance);
    }, 50); // Pequeña pausa para asegurar que las voces estén cargadas
  } else {
    console.warn('Tu navegador no soporta Text-to-Speech');
  }
};

// Caritas según especificación: 😊 verde, 🙂 amarillo, 😣 naranja, 😫 rojo
const painLevels = [
  { level: 0, emoji: '😊', label: 'Sin dolor', color: 'bg-green-500' },
  { level: 1, emoji: '😊', label: 'Muy leve', color: 'bg-green-400' },
  { level: 2, emoji: '🙂', label: 'Leve', color: 'bg-green-300' },
  { level: 3, emoji: '🙂', label: 'Molesto', color: 'bg-yellow-400' },
  { level: 4, emoji: '🙂', label: 'Incómodo', color: 'bg-yellow-500' },
  { level: 5, emoji: '🙂', label: 'Moderado', color: 'bg-yellow-600' },
  { level: 6, emoji: '😣', label: 'Doloroso', color: 'bg-orange-400' },
  { level: 7, emoji: '😣', label: 'Muy doloroso', color: 'bg-orange-500' },
  { level: 8, emoji: '😫', label: 'Intenso', color: 'bg-orange-600' },
  { level: 9, emoji: '😫', label: 'Muy intenso', color: 'bg-red-500' },
  { level: 10, emoji: '😫', label: 'Insoportable', color: 'bg-red-600' },
];

export function PainLevelSelector({ onSelect, onBack }: PainLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<PainLevel>(0);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenLevelRef = useRef<PainLevel | null>(null);

  const getSliderColor = (level: number) => {
    if (level <= 2) return 'bg-green-500';
    if (level <= 5) return 'bg-yellow-500';
    if (level <= 7) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCurrentEmoji = (level: number) => {
    return painLevels[level]?.emoji || '😊';
  };

  const getCurrentLabel = (level: number) => {
    return painLevels[level]?.label || 'Sin dolor';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const level = parseInt(e.target.value) as PainLevel;
    setSelectedLevel(level);
    
    // Reproducir audio con debounce para evitar demasiadas reproducciones al arrastrar
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    
    // Solo reproducir si el nivel cambió
    if (lastSpokenLevelRef.current !== level) {
      speakTimeoutRef.current = setTimeout(() => {
        const label = getCurrentLabel(level);
        speakText(`${level}, ${label}`);
        lastSpokenLevelRef.current = level;
      }, 300); // Esperar 300ms después de que el usuario deje de mover el slider
    }
  };

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
    };
  }, []);

  const handleConfirm = () => {
    onSelect(selectedLevel);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-blue-900 text-center mb-3">
          Nivel de Dolor
        </h1>
        <p className="text-2xl text-gray-700 font-semibold text-center">
          Toca la carita que mejor represente tu dolor
        </p>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {/* Carita seleccionada grande */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8 text-center">
            <div className="text-8xl mb-4">{getCurrentEmoji(selectedLevel)}</div>
            <div className={`text-6xl font-bold mb-2 ${getSliderColor(selectedLevel).replace('bg-', 'text-')}`}>
              {selectedLevel}
            </div>
            <div className="text-3xl font-semibold text-gray-800 mb-2">
              {getCurrentLabel(selectedLevel)}
            </div>
            <div className="text-xl text-gray-600">Escala EVA</div>
          </div>

          {/* Deslizante EVA */}
          <div className="bg-white rounded-3xl p-8 shadow-2xl mb-6">
            <div className="mb-6">
              <label className="block text-2xl font-bold text-gray-800 text-center mb-6">
                Escala EVA 0-10
              </label>
              
              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={selectedLevel}
                  onChange={handleSliderChange}
                  className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, 
                      #22c55e 0%, 
                      #22c55e ${(selectedLevel / 10) * 100 <= 20 ? (selectedLevel / 10) * 100 : 20}%, 
                      #eab308 ${selectedLevel > 2 ? 20 : (selectedLevel / 10) * 100}%, 
                      #eab308 ${selectedLevel > 5 ? 50 : (selectedLevel / 10) * 100}%, 
                      #f97316 ${selectedLevel > 5 ? 50 : (selectedLevel / 10) * 100}%, 
                      #f97316 ${selectedLevel > 7 ? 70 : (selectedLevel / 10) * 100}%, 
                      #ef4444 ${selectedLevel > 7 ? 70 : (selectedLevel / 10) * 100}%, 
                      #ef4444 100%)`
                  }}
                />
                
                {/* Estilos personalizados para el slider */}
                <style>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${selectedLevel <= 2 ? '#22c55e' : selectedLevel <= 5 ? '#eab308' : selectedLevel <= 7 ? '#f97316' : '#ef4444'};
                    cursor: pointer;
                    border: 4px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  }
                  .slider::-moz-range-thumb {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: ${selectedLevel <= 2 ? '#22c55e' : selectedLevel <= 5 ? '#eab308' : selectedLevel <= 7 ? '#f97316' : '#ef4444'};
                    cursor: pointer;
                    border: 4px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  }
                `}</style>
              </div>

              {/* Marcadores de escala */}
              <div className="flex justify-between mt-4 px-2">
                {[0, 2, 5, 7, 10].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <div className={`w-1 h-4 ${selectedLevel === value ? getSliderColor(value) : 'bg-gray-300'}`}></div>
                    <span className="text-lg font-semibold text-gray-700 mt-1">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Caritas de referencia */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                { emoji: '😊', label: 'Sin dolor', color: 'bg-green-500', levels: '0-2' },
                { emoji: '🙂', label: 'Dolor leve', color: 'bg-yellow-500', levels: '3-5' },
                { emoji: '😣', label: 'Dolor moderado', color: 'bg-orange-500', levels: '6-7' },
                { emoji: '😫', label: 'Dolor fuerte', color: 'bg-red-500', levels: '8-10' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    // Cuando se hace clic en una carita, establecer el nivel correspondiente
                    const minLevel = idx === 0 ? 0 : idx === 1 ? 3 : idx === 2 ? 6 : 8;
                    setSelectedLevel(minLevel as PainLevel);
                    const label = painLevels[minLevel]?.label || item.label;
                    speakText(`${minLevel}, ${label}`);
                  }}
                  className={`${item.color} p-4 rounded-2xl shadow-lg text-center hover:scale-105 active:scale-95 transition-transform cursor-pointer`}
                >
                  <div className="text-4xl mb-2">{item.emoji}</div>
                  <div className="text-white font-bold text-sm">{item.label}</div>
                  <div className="text-white text-xs mt-1">EVA {item.levels}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Botones fijos */}
      <div className="bg-white shadow-lg px-6 py-4 space-y-3">
        <Button
          onClick={handleConfirm}
          className="w-full h-24 text-3xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl"
        >
          CONTINUAR
        </Button>
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
