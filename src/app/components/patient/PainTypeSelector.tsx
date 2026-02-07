import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { PainType } from '@/app/types';

// Función para leer texto en voz alta
const speakText = (text: string, lang: string = 'es-ES') => {
  // Verificar si el navegador soporta speechSynthesis
  if ('speechSynthesis' in window) {
    // Cancelar cualquier síntesis de voz en curso
    window.speechSynthesis.cancel();
    
    // Crear una nueva instancia de SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9; // Velocidad de habla (0.1 a 10)
    utterance.pitch = 1; // Tono de voz (0 a 2)
    utterance.volume = 1; // Volumen (0 a 1)
    
    // Intentar encontrar una voz en español
    const setSpanishVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Buscar una voz en español
      const spanishVoice = voices.find(
        (voice) => voice.lang.startsWith('es') || voice.lang.startsWith('es-')
      );
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
    };
    
    // Las voces pueden no estar disponibles inmediatamente
    if (window.speechSynthesis.getVoices().length > 0) {
      setSpanishVoice();
    } else {
      // Esperar a que las voces estén disponibles
      window.speechSynthesis.onvoiceschanged = setSpanishVoice;
    }
    
    // Reproducir el texto
    window.speechSynthesis.speak(utterance);
  }
};

interface PainTypeSelectorProps {
  onSelect: (types: PainType[], comment?: string) => void;
  onBack: () => void;
}

const painTypes = [
  { 
    type: 'Punzante' as PainType, 
    color: 'bg-yellow-500', 
    image: '/images/Punzante.webp',
    example: 'Como una aguja'
  },
  { 
    type: 'Ardor' as PainType, 
    color: 'bg-orange-500', 
    image: '/images/ardor.webp',
    example: 'Quema / arde'
  },
  { 
    type: 'Presión' as PainType, 
    color: 'bg-blue-500', 
    image: '/images/presion.webp',
    example: 'Pesado / aplasta'
  },
  { 
    type: 'Eléctrico' as PainType, 
    color: 'bg-purple-500', 
    image: '/images/electrico.jpeg',
    example: 'Corriente'
  },
  { 
    type: 'Hormigueo' as PainType, 
    color: 'bg-teal-500', 
    image: '/images/hormigueo.jpg',
    example: 'Adormece'
  },
  { 
    type: 'General' as PainType, 
    color: 'bg-red-500', 
    image: '/images/dolor general.png',
    example: 'Molesto constante'
  },
];

export function PainTypeSelector({ onSelect, onBack }: PainTypeSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<PainType[]>([]);
  const [comment, setComment] = useState('');

  const handleToggleType = (type: PainType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        // Deseleccionar
        return prev.filter(t => t !== type);
      } else {
        // Seleccionar (permitir múltiples) y leer el nombre del tipo de dolor
        speakText(type);
        return [...prev, type];
      }
    });
  };

  const handleContinue = () => {
    if (selectedTypes.length > 0) {
      onSelect(selectedTypes, comment.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col">
      {/* Header fijo */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg px-6 py-8">
        <h1 className="text-4xl font-bold text-orange-900 text-center mb-3">
          ¿Cómo es tu dolor?
        </h1>
        <p className="text-2xl text-gray-700 text-center font-semibold">
          Elige cómo se siente tu dolor
        </p>
        {selectedTypes.length > 0 && (
          <p className="text-lg text-orange-700 text-center mt-2 font-medium">
            Seleccionado{selectedTypes.length > 1 ? 's' : ''}: {selectedTypes.length}
          </p>
        )}
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-6">
          {painTypes.map((item) => {
            const isSelected = selectedTypes.includes(item.type);
            return (
              <button
                key={item.type}
                onClick={() => handleToggleType(item.type)}
                className={`${item.color} hover:scale-105 active:scale-95 transition-all p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-3 min-h-[420px] sm:min-h-[380px] relative ${
                  isSelected ? 'ring-4 ring-blue-500 ring-offset-4 scale-105' : ''
                }`}
              >
                {/* Checkbox visual más grande */}
                <div className={`absolute top-3 right-3 w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 ${
                  isSelected 
                    ? 'bg-blue-600 border-blue-700' 
                    : 'bg-white/30 border-white/50'
                } flex items-center justify-center z-10`}>
                  {isSelected && (
                    <span className="text-white text-3xl sm:text-4xl font-bold">✓</span>
                  )}
                </div>
                
                {/* Imagen del tipo de dolor - MUY GRANDE PARA OCUPAR MÁS ESPACIO */}
                <div className="w-[280px] h-[280px] sm:w-72 sm:h-72 mb-3 flex items-center justify-center">
                  <img 
                    src={item.image} 
                    alt={item.type}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="text-white font-bold text-4xl sm:text-4xl text-center">
                  {item.type}
                </div>
                <div className="text-white/95 text-2xl sm:text-2xl text-center font-semibold">
                  {item.example}
                </div>
              </button>
            );
          })}
        </div>

        {/* Campo opcional de comentario */}
        <div className="max-w-2xl mx-auto mb-6">
          <label className="block text-xl font-semibold text-gray-700 mb-3">
            ¿Quieres agregar un comentario? (Opcional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe aquí cualquier detalle adicional sobre tu dolor..."
            className="h-32 text-lg p-4 rounded-xl shadow-lg resize-none"
            maxLength={200}
          />
          <p className="text-sm text-gray-500 mt-2 text-right">
            {comment.length}/200 caracteres
          </p>
        </div>
      </div>

      {/* Botones fijos */}
      <div className="bg-white shadow-lg px-6 py-4 space-y-3">
        <Button
          onClick={handleContinue}
          disabled={selectedTypes.length === 0}
          className="w-full h-24 text-3xl font-bold bg-orange-600 hover:bg-orange-700 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
