import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Medication, MedicationRecord } from '@/app/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { speakNatural } from '@/app/utils/speech';

interface MedicationsSectionProps {
  medications: Medication[];
  onMedicationRecord: (record: MedicationRecord) => void;
}

export function MedicationsSection({ medications, onMedicationRecord }: MedicationsSectionProps) {
  const activeMedications = medications.filter(med => med.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { taken?: boolean; reasonNotTaken?: string }>>({});
  const [showReasonModal, setShowReasonModal] = useState<string | null>(null);
  const [showInitialScreen, setShowInitialScreen] = useState(true);

  if (activeMedications.length === 0) {
    return null;
  }

  const currentMedication = activeMedications[currentIndex];
  const currentResponse = responses[currentMedication.id];

  // Verificar si todos los medicamentos han sido respondidos
  const allMedicationsAnswered = activeMedications.every(med => 
    responses[med.id]?.taken === true || responses[med.id]?.reasonNotTaken !== undefined
  );

  // Leer pregunta de razón cuando se muestra el modal
  useEffect(() => {
    if (showReasonModal && currentMedication) {
      const question = `¿Por qué no tomaste ${currentMedication.name}? Selecciona una opción: Me olvidé, Me sentí mal, No lo tenía, u Otro.`;
      setTimeout(() => speakNatural(question), 100);
    }
  }, [showReasonModal, currentMedication]);

  // Función para iniciar desde la pantalla inicial
  const handleStartMedications = () => {
    setShowInitialScreen(false);
    // Iniciar la pregunta del primer medicamento automáticamente
    if (currentMedication) {
      // Leer la pregunta después de mostrar los botones
      const question = `Medicamento: ${currentMedication.name}, ${currentMedication.dosage}. ¿Lo tomaste hoy? Responde sí o no.`;
      setTimeout(() => speakNatural(question), 200);
    }
  };

  const handleTaken = (medicationId: string, taken: boolean) => {
    if (taken) {
      // Actualizar estado inmediatamente para feedback visual rápido
      setResponses(prev => ({
        ...prev,
        [medicationId]: { taken: true }
      }));
      
      // Llamar callback después (no bloquea la UI)
      setTimeout(() => {
        onMedicationRecord({
          medicationId,
          date: new Date(),
          taken: true
        });
        
        // Avanzar al siguiente medicamento si hay más
        if (currentIndex < activeMedications.length - 1) {
          setCurrentIndex(currentIndex + 1);
          // Leer la pregunta del siguiente medicamento
          const nextMedication = activeMedications[currentIndex + 1];
          if (nextMedication) {
            const question = `Medicamento: ${nextMedication.name}, ${nextMedication.dosage}. ¿Lo tomaste hoy? Responde sí o no.`;
            setTimeout(() => speakNatural(question), 300);
          }
        }
      }, 0);
    } else {
      setShowReasonModal(medicationId);
    }
  };

  const handleReasonSelected = (medicationId: string, reason: string) => {
    // Actualizar estado inmediatamente para feedback visual rápido
    setResponses(prev => ({
      ...prev,
      [medicationId]: { taken: false, reasonNotTaken: reason }
    }));
    
    setShowReasonModal(null);
    
    // Llamar callback y avanzar después (no bloquea la UI)
    setTimeout(() => {
      onMedicationRecord({
        medicationId,
        date: new Date(),
        taken: false,
        reasonNotTaken: reason as any
      });
      
      // Avanzar al siguiente medicamento si hay más
      if (currentIndex < activeMedications.length - 1) {
        setCurrentIndex(currentIndex + 1);
        // Leer la pregunta del siguiente medicamento
        const nextMedication = activeMedications[currentIndex + 1];
        if (nextMedication) {
          const question = `Medicamento: ${nextMedication.name}, ${nextMedication.dosage}. ¿Lo tomaste hoy? Responde sí o no.`;
          setTimeout(() => speakNatural(question), 300);
        }
      }
    }, 0);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowReasonModal(null);
      // Leer la pregunta del medicamento anterior
      const prevMedication = activeMedications[currentIndex - 1];
      if (prevMedication) {
        const question = `Medicamento: ${prevMedication.name}, ${prevMedication.dosage}. ¿Lo tomaste hoy? Responde sí o no.`;
        setTimeout(() => speakNatural(question), 300);
      }
    }
  };

  const goToNext = () => {
    if (currentIndex < activeMedications.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowReasonModal(null);
      // Leer la pregunta del siguiente medicamento
      const nextMedication = activeMedications[currentIndex + 1];
      if (nextMedication) {
        const question = `Medicamento: ${nextMedication.name}, ${nextMedication.dosage}. ¿Lo tomaste hoy? Responde sí o no.`;
        setTimeout(() => speakNatural(question), 300);
      }
    }
  };

  const reasonOptions = [
    "Me olvidé",
    "Me sentí mal",
    "No lo tenía",
    "Otro"
  ];

  // Colores diferentes para cada medicamento
  const medicationColors = [
    { 
      pillBg: 'bg-cyan-100', 
      pillBorder: 'border-cyan-200',
      cardBorder: 'border-cyan-200',
      cardGradient: 'from-white to-cyan-50/30'
    },
    { 
      pillBg: 'bg-purple-100', 
      pillBorder: 'border-purple-200',
      cardBorder: 'border-purple-200',
      cardGradient: 'from-white to-purple-50/30'
    },
    { 
      pillBg: 'bg-pink-100', 
      pillBorder: 'border-pink-200',
      cardBorder: 'border-pink-200',
      cardGradient: 'from-white to-pink-50/30'
    },
    { 
      pillBg: 'bg-green-100', 
      pillBorder: 'border-green-200',
      cardBorder: 'border-green-200',
      cardGradient: 'from-white to-green-50/30'
    },
    { 
      pillBg: 'bg-orange-100', 
      pillBorder: 'border-orange-200',
      cardBorder: 'border-orange-200',
      cardGradient: 'from-white to-orange-50/30'
    },
    { 
      pillBg: 'bg-blue-100', 
      pillBorder: 'border-blue-200',
      cardBorder: 'border-blue-200',
      cardGradient: 'from-white to-blue-50/30'
    },
  ];

  const currentColor = medicationColors[currentIndex % medicationColors.length];

  return (
    <Card className="shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 pb-2">
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-700 text-center">
          <span className="block sm:hidden">
            Medicamentos indicados<br />por tu médico
          </span>
          <span className="hidden sm:inline">
            Medicamentos indicados por tu médico
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 lg:p-8">
        {showInitialScreen ? (
          /* Pantalla inicial con botón azul e imagen */
          <div className="text-center -mt-4 pb-2 sm:-mt-6 sm:pb-4">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <img 
                src="/images/pastillas.jpg" 
                alt="Pastillas"
                className="w-48 sm:w-64 lg:w-80 h-auto rounded-lg object-cover shadow-lg"
                onError={(e) => {
                  // Si la imagen no existe, mostrar un emoji como fallback
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <Button
              onClick={handleStartMedications}
              className="h-16 sm:h-20 px-8 sm:px-10 text-lg sm:text-xl lg:text-2xl font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.6),0_4px_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8),0_6px_20px_rgba(6,182,212,0.6)] transition-all duration-100 active:scale-[0.98]"
            >
              ¿Tomaste tu medicamento?
            </Button>
          </div>
        ) : allMedicationsAnswered ? (
          /* Mensaje de agradecimiento cuando se completan todos los medicamentos */
          <div className="text-center py-8 sm:py-12">
            <div className="mb-6 sm:mb-8">
              <span className="text-6xl sm:text-7xl lg:text-8xl">🙏</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-cyan-700 mb-4 sm:mb-6">
              ¡Gracias por registrar tus medicinas!
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto">
              Tu información nos ayuda a acompañarte mejor en tu tratamiento.
            </p>
          </div>
        ) : (
          <>
            {/* Indicador de progreso mejorado */}
            <div className="mb-6 sm:mb-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200">
                <span className="text-base sm:text-lg font-semibold text-cyan-600">
                  {currentIndex + 1} de {activeMedications.length}
                </span>
              </div>
            </div>

            {/* Medicamento actual */}
            <div className="space-y-6 sm:space-y-8">
              <div className={`bg-gradient-to-br ${currentColor.cardGradient} p-6 sm:p-8 rounded-2xl shadow-lg border-2 ${currentColor.cardBorder}`}>
                <div className="flex items-center justify-center gap-4 mb-6 sm:mb-8">
                  <div className={`${currentColor.pillBg} p-4 rounded-full border-2 ${currentColor.pillBorder}`}>
                <span className="text-4xl sm:text-5xl">💊</span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                  {currentMedication.name}
                </h3>
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mt-1">
                  {currentMedication.dosage}
                </p>
              </div>
            </div>

            {!showReasonModal ? (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                  ¿Lo tomaste hoy?
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center max-w-md mx-auto mb-6">
                  <Button
                    onClick={() => handleTaken(currentMedication.id, true)}
                    className="h-16 sm:h-20 text-lg sm:text-xl lg:text-2xl font-bold bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-100 active:scale-[0.98] flex-1"
                  >
                    ✅ Sí
                  </Button>
                  <Button
                    onClick={() => handleTaken(currentMedication.id, false)}
                    className="h-16 sm:h-20 text-lg sm:text-xl lg:text-2xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-100 active:scale-[0.98] flex-1"
                  >
                    ⭕ No
                  </Button>
                </div>
                
                {/* Botón azul para registrar medicamento */}
                {currentResponse && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => {
                        if (currentResponse.taken) {
                          onMedicationRecord({
                            medicationId: currentMedication.id,
                            date: new Date(),
                            taken: true
                          });
                        } else if (currentResponse.reasonNotTaken) {
                          onMedicationRecord({
                            medicationId: currentMedication.id,
                            date: new Date(),
                            taken: false,
                            reasonNotTaken: currentResponse.reasonNotTaken as any
                          });
                        }
                      }}
                      className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg lg:text-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-100 active:scale-[0.98]"
                    >
                      Registrar medicamento
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
                  ¿Por qué no lo tomaste?
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto mb-6">
                  {reasonOptions.map((reason) => (
                    <Button
                      key={reason}
                      onClick={() => handleReasonSelected(currentMedication.id, reason)}
                      className="h-16 sm:h-18 text-base sm:text-lg lg:text-xl font-semibold bg-white hover:bg-cyan-50 text-gray-800 border-2 border-cyan-200 hover:border-cyan-300 shadow-md hover:shadow-lg transition-all duration-100 active:scale-[0.98]"
                    >
                      {reason}
                    </Button>
                  ))}
                </div>
                
                {/* Botón azul para registrar medicamento después de seleccionar razón */}
                {currentResponse?.reasonNotTaken && (
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => {
                        onMedicationRecord({
                          medicationId: currentMedication.id,
                          date: new Date(),
                          taken: false,
                          reasonNotTaken: currentResponse.reasonNotTaken as any
                        });
                      }}
                      className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg lg:text-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-100 active:scale-[0.98]"
                    >
                      Registrar medicamento
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Navegación entre medicamentos */}
          {activeMedications.length > 1 && (
            <div className="flex justify-between items-center gap-4 pt-4 border-t-2 border-cyan-200">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-100 active:scale-[0.98]"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Anterior
              </Button>
              <Button
                onClick={goToNext}
                disabled={currentIndex === activeMedications.length - 1}
                className="h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg font-semibold bg-cyan-50 hover:bg-cyan-100 text-cyan-600 border border-cyan-200 hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-100 active:scale-[0.98]"
              >
                Siguiente
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
              </Button>
            </div>
          )}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
