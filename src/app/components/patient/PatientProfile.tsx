import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Patient, PainLevel } from '@/app/types';
import { getPatientRecords } from '@/app/data/mockData';
import { BodyMap } from './BodyMap';
import { ArrowLeft, User, Calendar, UserCircle, CreditCard } from 'lucide-react';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
}

export function PatientProfile({ patient, onBack }: PatientProfileProps) {
  // Validar que patient existe
  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-500 mb-4">Error: No se encontró información del paciente</p>
          <Button onClick={onBack} variant="outline" className="text-xl font-bold">
            VOLVER
          </Button>
        </div>
      </div>
    );
  }

  const records = getPatientRecords(patient.dni);
  const firstRecord = records.length > 0 ? records[0] : null;
  
  // Calcular fecha de nacimiento desde la edad
  const calculateBirthDate = (age: number): Date => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return new Date(birthYear, today.getMonth(), today.getDate());
  };

  const birthDate = calculateBirthDate(patient.age || 0);

  const getPainEmoji = (level: PainLevel) => {
    if (level <= 2) return '😊';
    if (level <= 5) return '🙂';
    if (level <= 7) return '😣';
    return '😫';
  };

  const getPainColor = (level: PainLevel) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 5) return 'text-yellow-600';
    if (level <= 7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPainLabel = (level: PainLevel) => {
    const labels: Record<PainLevel, string> = {
      0: 'Sin dolor',
      1: 'Muy leve',
      2: 'Leve',
      3: 'Molesto',
      4: 'Incómodo',
      5: 'Moderado',
      6: 'Doloroso',
      7: 'Muy doloroso',
      8: 'Intenso',
      9: 'Muy intenso',
      10: 'Insoportable',
    };
    return labels[level];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-12 sm:h-16 px-4 sm:px-6 text-xl sm:text-2xl font-bold"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            VOLVER
          </Button>
          <h1 className="text-3xl sm:text-5xl font-bold text-purple-900">
            Mi Perfil
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Información Personal */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-3">
                <UserCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Nombre */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Nombre
                  </label>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 ml-11">
                  {patient.name}
                </p>
              </div>

              {/* Fecha de Nacimiento */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Fecha de Nacimiento
                  </label>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 ml-11">
                  {birthDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-lg sm:text-xl text-gray-600 ml-11 mt-1">
                  ({patient.age} años)
                </p>
              </div>

              {/* Sexo */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Sexo
                  </label>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 ml-11">
                  {patient.gender}
                </p>
              </div>

              {/* DNI */}
              <div className="bg-purple-50 p-4 sm:p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    DNI
                  </label>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 ml-11">
                  {patient.dni}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dolor Inicial */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900">
                Dolor Inicial
              </CardTitle>
            </CardHeader>
            <CardContent>
              {firstRecord ? (
                <div className="space-y-6">
                  {/* Escala de Dolor */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl text-center">
                    <p className="text-xl sm:text-2xl text-gray-700 mb-4 font-semibold">
                      Nivel de Dolor Inicial
                    </p>
                    <div className="text-8xl sm:text-9xl mb-4">
                      {getPainEmoji(firstRecord.painLevel)}
                    </div>
                    <div className={`text-6xl sm:text-7xl font-bold mb-2 ${getPainColor(firstRecord.painLevel)}`}>
                      {firstRecord.painLevel}/10
                    </div>
                    <p className="text-2xl sm:text-3xl font-semibold text-gray-800">
                      {getPainLabel(firstRecord.painLevel)}
                    </p>
                    <p className="text-lg sm:text-xl text-gray-600 mt-2">
                      Escala EVA
                    </p>
                  </div>

                  {/* Ubicación del Dolor */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl">
                    <p className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center">
                      Ubicación del Dolor
                    </p>
                    <div className="bg-white rounded-xl p-4 min-h-[400px] flex items-center justify-center">
                      <BodyMap
                        gender={patient.gender === 'Hombre' ? 'hombre' : patient.gender === 'Mujer' ? 'mujer' : 'hombre'}
                        registeredLocations={[firstRecord.location]}
                        customPoints={[]}
                        onSelect={() => {
                          // Función vacía para evitar errores
                        }}
                        onCustomPointsChange={() => {
                          // Función vacía para evitar errores
                        }}
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-xl sm:text-2xl font-bold text-purple-700">
                        {firstRecord.location}
                      </p>
                      <p className="text-lg sm:text-xl text-gray-600 mt-1">
                        Tipo: {firstRecord.type}
                      </p>
                      <p className="text-base sm:text-lg text-gray-500 mt-2">
                        Fecha: {new Date(firstRecord.date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <p className="text-2xl sm:text-3xl text-gray-500 mb-4">
                    No hay registro de dolor inicial
                  </p>
                  <p className="text-xl sm:text-2xl text-gray-400">
                    El dolor inicial se mostrará después del primer registro
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
