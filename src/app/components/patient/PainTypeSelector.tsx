import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { PainType } from '@/app/types';
import { speakNatural } from '@/app/utils/speech';

interface PainTypeSelectorProps {
  onSelect: (types: PainType[], otherText?: string) => void;
  onBack: () => void;
}

const painTypes = [
  { 
    type: 'Apretado' as PainType, 
    color: 'bg-blue-500',
    image: '/images/presion.webp',
    example: 'Sensación de presión o compresión, como si algo te apretara'
  },
  { 
    type: 'Punzante' as PainType, 
    color: 'bg-yellow-500',
    image: '/images/Punzante.webp',
    example: 'Dolor agudo y penetrante, como si te pincharan con una aguja'
  },
  { 
    type: 'Pulsátil' as PainType, 
    color: 'bg-purple-500',
    image: '/images/dolor general.png',
    example: 'Dolor que late o palpita, como el latido del corazón'
  },
  { 
    type: 'Corriente' as PainType, 
    color: 'bg-indigo-500',
    image: '/images/electrico.jpeg',
    example: 'Sensación de corriente eléctrica o descarga que recorre el cuerpo'
  },
  { 
    type: 'Quemante' as PainType, 
    color: 'bg-orange-500',
    image: '/images/ardor.webp',
    example: 'Sensación de quemazón intensa, como si algo te quemara'
  },
  { 
    type: 'Ardor' as PainType, 
    color: 'bg-red-500',
    image: '/images/ardor.webp',
    example: 'Sensación de ardor o escozor, como una quemadura leve'
  },
  { 
    type: 'Calambre' as PainType, 
    color: 'bg-pink-500',
    image: '/images/dolor general.png',
    example: 'Dolor con contracción muscular involuntaria o espasmo'
  },
  { 
    type: 'Cólico' as PainType, 
    color: 'bg-rose-500',
    image: '/images/dolor general.png',
    example: 'Dolor abdominal intenso que viene en oleadas o espasmos'
  },
  { 
    type: 'Sordo' as PainType, 
    color: 'bg-gray-500',
    image: '/images/dolor general.png',
    example: 'Dolor constante y molesto, no muy agudo pero persistente'
  },
  { 
    type: 'Tirante' as PainType, 
    color: 'bg-teal-500',
    image: '/images/hormigueo.jpg',
    example: 'Sensación de tensión o estiramiento, como si algo tirara de ti'
  },
];

export function PainTypeSelector({ onSelect, onBack }: PainTypeSelectorProps) {
  const [selectedTypes, setSelectedTypes] = useState<PainType[]>([]);
  const [otherText, setOtherText] = useState('');
  
  // Debug: verificar cuando se selecciona "Otro"
  useEffect(() => {
    if (selectedTypes.includes('Otro' as PainType)) {
      console.log('Otro está seleccionado');
    }
  }, [selectedTypes]);

  // Leer pregunta cuando aparece la pantalla
  // useEffect(() => {
  //   const question = `¿Cómo es tu dolor? Elige cómo se siente tu dolor. Puedes seleccionar más de una opción tocando las tarjetas.`;
  //   setTimeout(() => speakNatural(question), 100);
  // }, []);

  const handleToggleType = (type: PainType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        speakNatural(type);
        const newTypes = [...prev, type];
        
        // setTimeout(() => {
        //   const painTypeItem = painTypes.find(item => item.type === type);
        //   if (painTypeItem) {
        //     // Leer nombre y descripción
        //     const fullText = `${painTypeItem.type}. ${painTypeItem.example}`;
        //     speakNatural(fullText);
        //   } else if (type === 'Otro') {
        //     // Si es "Otro", leer el mensaje completo sobre el punto naranja
        //     const message = "Otro. En la pantalla aparecerá un punto naranja que puedes ubicar en cualquier parte del cuerpo. Presiona sobre la parte que te duele.";
        //     speakNatural(message);
        //   } else {
        //     // Para otros tipos no encontrados, solo leer el nombre
        //     speakNatural(type);
        //   }
        // }, 0);
        
        return newTypes;
      }
    });
  };

  const handleContinue = () => {
    if (selectedTypes.length > 0 || (selectedTypes.includes('Otro' as PainType) && otherText.trim())) {
      onSelect(selectedTypes, otherText.trim() || undefined);
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
                className={`${item.color} hover:scale-105 active:scale-[0.98] transition-all duration-100 p-4 sm:p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center gap-3 min-h-[420px] sm:min-h-[380px] relative ${
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
                <div className="text-white font-bold text-4xl sm:text-4xl text-center mb-2">
                  {item.type}
                </div>
                <div className="text-white/95 text-xl sm:text-2xl text-center font-semibold px-2">
                  {item.example}
                </div>
              </button>
            );
          })}
        </div>

        {/* Campo "Otro" */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  handleToggleType('Otro' as PainType);
                }}
                className={`p-4 sm:p-6 rounded-xl text-xl sm:text-2xl font-bold transition-all duration-100 active:scale-[0.98] ${
                  selectedTypes.includes('Otro' as PainType)
                    ? 'bg-purple-500 text-white shadow-xl scale-105' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 hover:shadow-md'
                }`}
              >
                Otro:
              </button>
              {selectedTypes.includes('Otro' as PainType) && (
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Describe tu dolor..."
                  className="flex-1 p-4 sm:p-6 rounded-xl text-lg sm:text-xl border-2 border-gray-300 focus:border-purple-500 focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones fijos */}
      <div className="bg-white shadow-lg px-6 py-4 space-y-3">
        <Button
          onClick={handleContinue}
          disabled={selectedTypes.length === 0 || (selectedTypes.includes('Otro' as PainType) && !otherText.trim())}
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
