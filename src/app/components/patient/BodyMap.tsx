import { useState, useRef, useEffect } from 'react';
import { PainLocation } from '@/app/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';

export interface CustomPoint {
  id: string;
  x: number; // porcentaje
  y: number; // porcentaje
  view: 'front' | 'back';
  confirmed: boolean; // true = rojo, false = naranja (pendiente)
}

interface BodyMapProps {
  gender: 'hombre' | 'mujer' | 'Hombre' | 'Mujer';
  registeredLocations?: PainLocation[];
  customPoints?: CustomPoint[];
  onSelect: (location: PainLocation, customPoints?: CustomPoint[]) => void;
  onCustomPointsChange?: (points: CustomPoint[]) => void;
}

// Coordenadas de los puntos interactivos - 9 puntos totales
// Nota: Usamos strings para las ubicaciones específicas ya que PainLocation ahora es más simple
const bodyPoints: Array<{
  location: string; // Usamos string para permitir ubicaciones específicas como "Rodilla izquierda"
  front: { x: number; y: number; size: number };
  back: { x: number; y: number; size: number };
}> = [
  {
    location: 'Cabeza',
    front: { x: 49, y: 5, size: 3.5 },
    back: { x: 50, y: 12, size: 3.5 },
  },
  {
    location: 'Pecho',
    front: { x: 50, y: 28, size: 4 },
    back: { x: 50, y: 26, size: 4 },
  },
  {
    location: 'Estómago',
    front: { x: 50, y: 39, size: 4 },
    back: { x: 50, y: 42, size: 4 },
  },
  {
    location: 'Rodilla izquierda',
    front: { x: 44, y: 70, size: 3.5 },
    back: { x: 50, y: 76, size: 3.5 },
  },
  {
    location: 'Rodilla derecha',
    front: { x: 55, y: 70, size: 3.5 },
    back: { x: 51, y: 76, size: 3.5 },
  },
  {
    location: 'Muñeca derecha',
    front: { x: 32, y: 48, size: 3.5 },
    back: { x: 30, y: 62, size: 3.5 },
  },
  {
    location: 'Muñeca izquierdo',
    front: { x: 67, y: 48, size: 3.5 },
    back: { x: 30, y: 62, size: 3.5 },
  },
  {
    location: 'Tobillo derecho',
    front: { x: 54, y: 90, size: 3.5 },
    back: { x: 48, y: 90, size: 3.5 },
  },
  {
    location: 'Tobillo izquierdo',
    front: { x: 45, y: 90, size: 3.5 },
    back: { x: 48, y: 90, size: 3.5 },
  },
  {
    location: 'Cadera',
    front: { x: 58, y: 44, size: 3.5 },
    back: { x: 48, y: 90, size: 3.5 },
  },
  {
    location: 'Hombro derecho',
    front: { x: 63, y: 21, size: 3.5 },
    back: { x: 48, y: 90, size: 3.5 },
  },
  {
    location: 'Hombro izquierdo',
    front: { x: 35, y: 21, size: 3.5 },
    back: { x: 48, y: 90, size: 3.5 },
  },
];

// Mapeo de ubicaciones a imágenes específicas
const locationImages: Record<string, string> = {
  'Rodilla derecha': '/images/cuerpo/rodilla derecha.png',
  'Rodilla izquierda': '/images/cuerpo/rodilla derecha.png', // Usar la misma imagen o agregar específica
  'Muñeca izquierdo': '/images/cuerpo/muñeca izquierda.png',
  'Muñeca derecha': '/images/cuerpo/dorso mano izquierda.jpg',
  // Agregar más mapeos según sea necesario
};

// Mapeo de partes generales a sub-opciones específicas
const bodyPartSubOptions: Record<string, string[]> = {
  'Rodillas': ['Rodilla izquierda', 'Rodilla derecha'],
  'Pecho': ['Pecho superior', 'Pecho medio', 'Pecho inferior', 'Pecho completo'],
  'Cabeza': ['Frente', 'Sien izquierda', 'Sien derecha', 'Nuca', 'Parte superior', 'Parte posterior'],
  'Estómago': ['Estómago superior', 'Estómago medio', 'Estómago inferior', 'Abdomen completo'],
  'Espalda': ['Espalda superior', 'Espalda media', 'Espalda inferior', 'Espalda completa'],
  'Brazos / Piernas': ['Brazo izquierdo', 'Brazo derecho', 'Pierna izquierda', 'Pierna derecha'],
  'Muñecas': ['Muñeca izquierda', 'Muñeca derecha'],
  'Tobillos': ['Tobillo izquierdo', 'Tobillo derecho'],
  'Hombros': ['Hombro izquierdo', 'Hombro derecho'],
};

// Función para generar audio usando Web Speech API con voz más natural
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

export function BodyMap({ gender, registeredLocations = [], customPoints: externalCustomPoints = [], onSelect, onCustomPointsChange }: BodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedLocation, setSelectedLocation] = useState<PainLocation | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogLocation, setDialogLocation] = useState<PainLocation | null>(null);
  const [showSubOptions, setShowSubOptions] = useState(false);
  const [subOptionsLocation, setSubOptionsLocation] = useState<string | null>(null);
  
  // Estados para modo "Otro"
  const [isOtherMode, setIsOtherMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{ x: number; y: number } | null>(null);
  const [showConfirmBubble, setShowConfirmBubble] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [imageError, setImageError] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Usar puntos externos siempre (vienen del estado del padre)
  const customPoints = externalCustomPoints || [];
  
  // Función para actualizar puntos personalizados
  const updateCustomPoints = (newPoints: CustomPoint[]) => {
    if (onCustomPointsChange) {
      onCustomPointsChange(newPoints);
    }
  };

  // Versión de imagen para evitar caché (cambiar este número cuando actualices las imágenes)
  const IMAGE_VERSION = '4';
  
  // Normalizar género para comparación (aceptar tanto mayúsculas como minúsculas)
  const normalizedGender = gender.toLowerCase() === 'hombre' || gender === 'Hombre' ? 'hombre' : 'mujer';
  
  const frontImage = normalizedGender === 'hombre' 
    ? `/images/cuerpo/hombre_front-removebg-preview.png?v=${IMAGE_VERSION}`
    : `/images/cuerpo/mujer_front-removebg-preview.png?v=${IMAGE_VERSION}`;
  
  const backImage = normalizedGender === 'hombre'
    ? `/images/cuerpo/hombre_back-removebg-preview.png?v=${IMAGE_VERSION}`
    : `/images/cuerpo/mujer_back-removebg-preview.png?v=${IMAGE_VERSION}`;

  const handlePointClick = (location: PainLocation | string) => {
    // Si es "Otro", activar modo de selección libre
    if (location === 'Otro') {
      setIsOtherMode(true);
      setSelectedLocation('Otro');
      // Si ya hay un punto pendiente, mantenerlo
      return;
    }
    
    setSelectedLocation(location);
    
    // Verificar si esta parte tiene sub-opciones
    const subOptions = bodyPartSubOptions[location];
    
    if (subOptions && subOptions.length > 0) {
      // Mostrar diálogo de sub-opciones
      setSubOptionsLocation(location);
      setShowSubOptions(true);
      speakText(location);
    } else {
      // Mostrar diálogo normal con imagen
      setDialogLocation(location as PainLocation);
      setShowDialog(true);
      speakText(location);
    }
  };

  // Manejar movimiento del mouse para seguir el cursor con punto naranja
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isOtherMode) {
      setCursorPosition(null);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCursorPosition({ x, y });
  };

  // Manejar clic en el mapa cuando está en modo "Otro"
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isOtherMode) return;
    
    // Evitar que se active si se hace clic en un punto existente o en el globo
    const target = e.target as HTMLElement;
    if (target.closest('.absolute') && !target.closest('.bg-orange-500')) {
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPendingPoint({ x, y });
    setShowConfirmBubble(true);
    setCursorPosition(null); // Ocultar punto que sigue el cursor al hacer clic
  };

  // Confirmar punto personalizado
  const handleConfirmCustomPoint = () => {
    if (pendingPoint) {
      const newPoint: CustomPoint = {
        id: `custom-${Date.now()}`,
        x: pendingPoint.x,
        y: pendingPoint.y,
        view: view,
        confirmed: false, // Pendiente (naranja) hasta completar el flujo completo
      };
      const updatedPoints = [...customPoints, newPoint];
      // Actualizar primero los puntos
      updateCustomPoints(updatedPoints);
      setPendingPoint(null);
      setShowConfirmBubble(false);
      setIsOtherMode(false);
      setCursorPosition(null);
      // Pasar los puntos actualizados directamente al navegar
      onSelect('Otro', updatedPoints);
    }
  };

  // Cancelar punto personalizado
  const handleCancelCustomPoint = () => {
    setPendingPoint(null);
    setShowConfirmBubble(false);
  };

  const handleSubOptionSelect = (subOption: string) => {
    setShowSubOptions(false);
    // Mostrar el diálogo con la imagen de la sub-opción seleccionada
    setDialogLocation(subOption as PainLocation);
    setShowDialog(true);
    speakText(subOption);
  };

  const handleConfirmSelection = () => {
    if (dialogLocation) {
      // Mapear ubicaciones específicas a tipos PainLocation válidos
      let mappedLocation: PainLocation = dialogLocation as PainLocation;
      
      // Si es una ubicación específica, mapearla a la categoría general
      if (typeof dialogLocation === 'string') {
        if (dialogLocation.includes('Rodilla')) {
          mappedLocation = 'Rodillas';
        } else if (dialogLocation.includes('Muñeca') || dialogLocation.includes('Hombro')) {
          mappedLocation = 'Brazos';
        } else if (dialogLocation.includes('Tobillo') || dialogLocation.includes('Cadera')) {
          mappedLocation = 'Piernas';
        } else if (['Cabeza', 'Pecho', 'Estómago', 'Espalda', 'Brazos', 'Piernas', 'Otro'].includes(dialogLocation)) {
          mappedLocation = dialogLocation as PainLocation;
        } else {
          // Por defecto usar "Otro" si no se puede mapear
          mappedLocation = 'Otro';
        }
      }
      
      onSelect(mappedLocation, customPoints);
      setShowDialog(false);
      setDialogLocation(null);
    }
  };

  const handleCancelDialog = () => {
    setShowDialog(false);
    setDialogLocation(null);
  };

  const handleCancelSubOptions = () => {
    setShowSubOptions(false);
    setSubOptionsLocation(null);
  };

  // Cerrar globo de confirmación al hacer clic fuera
  useEffect(() => {
    if (!showConfirmBubble || !pendingPoint) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.z-30')) {
        setPendingPoint(null);
        setShowConfirmBubble(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showConfirmBubble, pendingPoint]);

  const currentImage = view === 'front' ? frontImage : backImage;
  const currentPoints = bodyPoints.map(p => ({
    location: p.location,
    coords: view === 'front' ? p.front : p.back,
  }));

  // Resetear error de imagen al cambiar de vista o género
  useEffect(() => {
    setImageError(false);
  }, [view, gender]);

  // Verificar si hay puntos personalizados (confirmados o pendientes) para "Otro"
  const hasCustomPoints = customPoints.length > 0;
  const isOtherRegistered = registeredLocations.includes('Otro') || hasCustomPoints;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Selector de vista */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => {
            setView('front');
            // Limpiar punto pendiente al cambiar de vista
            if (pendingPoint) {
              setPendingPoint(null);
              setShowConfirmBubble(false);
            }
          }}
          className={`px-8 py-4 rounded-2xl text-2xl font-bold transition-all ${
            view === 'front'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 shadow-md'
          }`}
        >
          Frente
        </button>
        <button
          onClick={() => {
            setView('back');
            // Limpiar punto pendiente al cambiar de vista
            if (pendingPoint) {
              setPendingPoint(null);
              setShowConfirmBubble(false);
            }
          }}
          className={`px-8 py-4 rounded-2xl text-2xl font-bold transition-all ${
            view === 'back'
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-white text-gray-600 shadow-md'
          }`}
        >
          Espalda
        </button>
      </div>

      {/* Mensaje cuando está en modo "Otro" */}
      {isOtherMode && (
        <div className="mb-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            Elige el punto donde te duele
          </p>
        </div>
      )}

      {/* Mapa corporal */}
      <div className="relative bg-white rounded-3xl p-6 shadow-2xl">
        <div 
          ref={mapContainerRef}
          className="relative w-full" 
          style={{ aspectRatio: '2/3' }}
          onClick={handleMapClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursorPosition(null)}
        >
          {/* Imagen de fondo */}
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500 text-xl">Error al cargar la imagen</p>
            </div>
          ) : (
            <img
              src={currentImage}
              alt={`Silueta ${view === 'front' ? 'frontal' : 'posterior'} ${gender}`}
              className={`w-full h-full object-contain ${isOtherMode ? 'cursor-crosshair' : ''}`}
              onError={() => {
                console.error('Error cargando imagen:', currentImage);
                setImageError(true);
              }}
              onLoad={() => setImageError(false)}
            />
          )}

          {/* Puntos interactivos - círculos morados con símbolo de diana blanco */}
          {currentPoints.map((point) => {
            const isSelected = selectedLocation === point.location;
            const isRegistered = registeredLocations.includes(point.location);
            return (
              <div
                key={`${view}-${point.location}`}
                className="absolute"
                style={{
                  left: `${point.coords.x}%`,
                  top: `${point.coords.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Anillo de parpadeo alrededor del punto - solo si no está registrado ni seleccionado */}
                {!isSelected && !isRegistered && (
                  <div
                    className="absolute rounded-full border-2 border-purple-600"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${point.coords.size * 1.8}%`,
                      height: `${point.coords.size * 1.8}%`,
                      minWidth: '60px',
                      minHeight: '60px',
                      maxWidth: '90px',
                      maxHeight: '90px',
                      animation: 'pulse-ring 2s ease-in-out infinite',
                    }}
                  />
                )}
                {/* Punto morado principal o rojo si está registrado */}
                <button
                  onClick={() => handlePointClick(point.location)}
                  className={`absolute rounded-full transition-all hover:scale-125 active:scale-95 cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-red-600 ring-2 ring-red-400 ring-offset-1 shadow-lg z-10'
                      : isRegistered
                      ? 'bg-red-600 shadow-lg'
                      : 'bg-purple-700 hover:bg-purple-800 shadow-md'
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: `${point.coords.size}%`,
                    height: `${point.coords.size}%`,
                    minWidth: '32px',
                    minHeight: '32px',
                    maxWidth: '48px',
                    maxHeight: '48px',
                    opacity: isRegistered ? 1 : undefined, // Sin opacidad si está registrado
                  }}
                  title={point.location}
                >
                  {/* Símbolo de diana blanco dentro del círculo - solo si no está registrado ni seleccionado */}
                  {!isSelected && !isRegistered && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Círculo exterior blanco (anillo) */}
                      <div 
                        className="absolute rounded-full border-2 border-white"
                        style={{
                          width: '70%',
                          height: '70%',
                        }}
                      />
                      {/* Círculo interior blanco sólido (centro) */}
                      <div 
                        className="absolute rounded-full bg-white"
                        style={{
                          width: '35%',
                          height: '35%',
                        }}
                      />
                    </div>
                  )}
                  {/* Cuando está seleccionado o registrado, mostrar checkmark blanco */}
                  {(isSelected || isRegistered) && (
                    <span className="text-white text-lg font-bold">✓</span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Punto naranja que sigue el cursor cuando está en modo "Otro" */}
          {cursorPosition && isOtherMode && !pendingPoint && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: `${cursorPosition.x}%`,
                top: `${cursorPosition.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="absolute rounded-full bg-orange-500 shadow-md"
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  minHeight: '32px',
                  maxWidth: '40px',
                  maxHeight: '40px',
                }}
              />
            </div>
          )}

          {/* Puntos personalizados - naranjas (pendientes) y rojos (confirmados) */}
          {customPoints
            .filter(p => p.view === view)
            .map((point) => (
              <div
                key={point.id}
                className="absolute"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`absolute rounded-full shadow-md flex items-center justify-center ${
                    point.confirmed ? 'bg-red-600' : 'bg-orange-500'
                  }`}
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    maxWidth: '40px',
                    maxHeight: '40px',
                  }}
                >
                  {point.confirmed && (
                    <span className="text-white text-sm font-bold">✓</span>
                  )}
                </div>
              </div>
            ))}

          {/* Punto anaranjado pendiente */}
          {pendingPoint && showConfirmBubble && (
            <>
              <div
                className="absolute z-20"
                style={{
                  left: `${pendingPoint.x}%`,
                  top: `${pendingPoint.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                {/* Punto anaranjado */}
                <div
                  className="absolute rounded-full bg-orange-500 shadow-md"
                  style={{
                    width: '32px',
                    height: '32px',
                    minWidth: '32px',
                    minHeight: '32px',
                    maxWidth: '40px',
                    maxHeight: '40px',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
                
                {/* Globo de confirmación - posicionado fuera del área del punto */}
                <div
                  className="absolute bg-white rounded-lg shadow-xl p-3 border-2 border-orange-500 z-30"
                  style={{ 
                    minWidth: '150px',
                    top: 'calc(50% + 24px)', // 16px (mitad del punto) + 8px de separación
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                  }}
                >
                  <p className="text-sm font-semibold text-gray-800 mb-2 text-center">
                    ¿Confirmar este punto?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmCustomPoint();
                      }}
                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-green-700"
                    >
                      ✓ Sí
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelCustomPoint();
                      }}
                      className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-red-700"
                    >
                      ✗ No
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Leyenda de zonas - Solo partes seleccionadas como chips */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-center">
          {/* Mostrar solo las partes registradas como chips */}
          {registeredLocations
            .filter(loc => loc !== 'Otro')
            .map((location) => {
              const isSelected = selectedLocation === location;
              return (
                <button
                  key={location}
                  onClick={() => handlePointClick(location)}
                  className={`px-4 py-2 rounded-full text-lg font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-red-500 text-white ring-2 ring-red-300 shadow-lg scale-105'
                      : 'bg-red-600 text-white shadow-md hover:bg-red-700'
                  }`}
                >
                  <span>✓</span>
                  {location}
                </button>
              );
            })}
          
          {/* Opción "Otro" siempre visible en morado */}
          <button
            onClick={() => handlePointClick('Otro')}
            className={`px-4 py-2 rounded-full text-lg font-semibold transition-all flex items-center gap-2 ${
              selectedLocation === 'Otro'
                ? 'bg-purple-700 text-white ring-2 ring-purple-400 shadow-lg scale-105'
                : isOtherRegistered
                ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                : 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
            }`}
          >
            {isOtherRegistered && <span>✓</span>}
            Otro
          </button>
        </div>
      </div>

      {/* Dialog para seleccionar sub-opciones de partes del cuerpo */}
      <Dialog open={showSubOptions} onOpenChange={setShowSubOptions}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-purple-900 mb-4">
              Selecciona la zona específica
            </DialogTitle>
            <p className="text-xl text-center text-gray-600">
              {subOptionsLocation}
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            {subOptionsLocation && bodyPartSubOptions[subOptionsLocation]?.map((option) => (
              <Button
                key={option}
                onClick={() => handleSubOptionSelect(option)}
                className="h-20 sm:h-24 text-xl sm:text-2xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-all hover:scale-105"
              >
                {option}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={handleCancelSubOptions}
              variant="outline"
              className="w-full sm:w-auto h-16 text-2xl font-bold"
            >
              CANCELAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog/Popup para mostrar el nombre y la imagen de la parte seleccionada */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center text-purple-900">
              {dialogLocation}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            {dialogLocation && locationImages[dialogLocation] ? (
              <div className="w-full flex justify-center">
                <img
                  src={locationImages[dialogLocation]}
                  alt={dialogLocation}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <div className="text-xl text-gray-600 text-center py-8">
                Imagen no disponible para esta zona
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCancelDialog}
              variant="outline"
              className="w-full sm:w-auto h-16 text-2xl font-bold"
            >
              CANCELAR
            </Button>
            <Button
              onClick={handleConfirmSelection}
              className="w-full sm:w-auto h-16 text-2xl font-bold bg-purple-600 hover:bg-purple-700"
            >
              CONFIRMAR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
