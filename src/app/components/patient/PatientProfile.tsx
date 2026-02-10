import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Patient, PainLevel } from '@/app/types';
import { getPatientRecords } from '@/app/data/mockData';
import { ArrowLeft, User, Calendar, UserCircle, CreditCard, Briefcase, FileText, Megaphone } from 'lucide-react';
import { speakNatural } from '@/app/utils/speech';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
  onPatientUpdate?: (patient: Patient) => void;
}

export function PatientProfile({ patient, onBack, onPatientUpdate }: PatientProfileProps) {
  const [occupation, setOccupation] = useState(patient.occupation ?? '');
  const [heatmapView, setHeatmapView] = useState<'frente' | 'espalda'>('frente');

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
  const lastRecord = records.length > 0 ? records[records.length - 1] : null;
  const painLevels = records.map((r) => r.painLevel as number);
  const bestEva = painLevels.length ? Math.min(...painLevels) : null;
  const worstEva = painLevels.length ? Math.max(...painLevels) : null;
  const currentEva = lastRecord ? lastRecord.painLevel : null;

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

  const handleSavePersonal = () => {
    const updated: Patient = {
      ...patient,
      occupation: occupation || undefined,
    };
    onPatientUpdate?.(updated);
  };

  const birthDateStr = birthDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const readFullProfile = () => {
    const parts: string[] = [
      `Información personal. Nombre: ${patient.name}.`,
      `Fecha de nacimiento: ${birthDateStr}. ${patient.age} años.`,
      `Sexo: ${patient.gender}.`,
      `Ocupación: ${occupation || 'No indicada'}.`,
      `DNI: ${patient.dni}.`,
      `Diagnóstico del médico: ${patient.doctorDiagnosis || 'No indicado'}.`,
    ];
    if (records.length > 0 && bestEva !== null && worstEva !== null && currentEva !== null) {
      parts.push(
        `Evolución del dolor. Mejor: ${bestEva} de 10. Peor: ${worstEva} de 10. Actual: ${currentEva} de 10.`
      );
      parts.push(`Mapa de calor. Vista ${heatmapView === 'frente' ? 'frente' : 'espalda'}.`);
      if (lastRecord) {
        parts.push(
          `Último registro: ${lastRecord.location}, ${lastRecord.type}. ${new Date(lastRecord.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`
        );
      }
    } else {
      parts.push('Evolución del dolor. No hay registros todavía. Mapa de calor.');
    }
    speakNatural(parts.join(' '));
  };

  // Al entrar a esta pantalla, leer todos los datos del perfil en voz alta
  useEffect(() => {
    const t = setTimeout(readFullProfile, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
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
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-3">
                <UserCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                Información Personal
              </CardTitle>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={readFullProfile}
                  className="flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition hover:bg-purple-700 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                  aria-label="Escuchar todo el perfil en voz alta"
                >
                  <Megaphone className="h-7 w-7 sm:h-8 sm:w-8" />
                </button>
                <span className="text-base sm:text-lg font-semibold text-purple-900">
                  Si desea escuchar sus datos, pulse el botón circular morado con el megáfono
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Foto de perfil en círculo */}
              <div className="flex justify-center">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-purple-200 shadow-lg bg-purple-100 flex-shrink-0">
                  <img
                    src="/images/foto-perfil-paciente.png"
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Nombre */}
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl"
                tabIndex={0}
                onFocus={() => speakNatural(`Nombre. ${patient.name}`)}
                role="button"
              >
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
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl"
                tabIndex={0}
                onFocus={() => speakNatural(`Fecha de nacimiento. ${birthDateStr}. ${patient.age} años.`)}
                role="button"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Fecha de Nacimiento
                  </label>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 ml-11">
                  {birthDateStr}
                </p>
                <p className="text-lg sm:text-xl text-gray-600 ml-11 mt-1">
                  ({patient.age} años)
                </p>
              </div>

              {/* Sexo (solo lectura) */}
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl"
                tabIndex={0}
                onFocus={() => speakNatural(`Sexo. ${patient.gender}`)}
                role="button"
              >
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

              {/* Ocupación (editable) */}
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 rounded-xl min-w-0 overflow-hidden"
                tabIndex={0}
                onFocus={() => speakNatural(`Ocupación. ${occupation || 'No indicada'}`)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Ocupación
                  </label>
                </div>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Ej. Comerciante, Ama de casa"
                  className="ml-11 w-full max-w-full min-w-0 box-border text-xl sm:text-2xl font-bold text-purple-900 bg-white border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-500 placeholder:text-purple-300"
                />
              </div>

              {/* DNI */}
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl"
                tabIndex={0}
                onFocus={() => speakNatural(`DNI. ${patient.dni}`)}
                role="button"
              >
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

              {/* Diagnóstico del médico (solo lectura) */}
              <div
                className="bg-purple-50 p-4 sm:p-6 rounded-xl cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl"
                tabIndex={0}
                onFocus={() =>
                  speakNatural(
                    `Diagnóstico del médico. ${patient.doctorDiagnosis || 'No indicado'}`
                  )
                }
                role="button"
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  <label className="text-lg sm:text-xl font-semibold text-gray-700">
                    Diagnóstico del médico
                  </label>
                </div>
                <p className="text-lg sm:text-xl font-medium text-purple-900 ml-11 whitespace-pre-line">
                  {patient.doctorDiagnosis || '—'}
                </p>
              </div>

              {occupation !== (patient.occupation ?? '') && (
                <Button
                  onClick={handleSavePersonal}
                  className="w-full h-12 sm:h-14 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Guardar cambios
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Evolución del dolor (antes "Dolor Inicial") */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900">
                Evolución del dolor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {records.length > 0 ? (
                <>
                  {/* Mejor, Peor, Actual */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-2xl"
                    tabIndex={0}
                    onFocus={() =>
                      speakNatural(
                        `Evolución del dolor. Mejor: ${bestEva} de 10. Peor: ${worstEva} de 10. Actual: ${currentEva} de 10.`
                      )
                    }
                  >
                    {bestEva !== null && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-base sm:text-lg text-gray-700 mb-2 font-semibold w-full">Mejor</p>
                        <div className="text-5xl sm:text-6xl mb-2 flex justify-center">{getPainEmoji(bestEva as PainLevel)}</div>
                        <div className={`text-4xl sm:text-5xl font-bold w-full flex justify-center ${getPainColor(bestEva as PainLevel)}`}>
                          {bestEva}/10
                        </div>
                      </div>
                    )}
                    {worstEva !== null && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-base sm:text-lg text-gray-700 mb-2 font-semibold w-full">Peor</p>
                        <div className="text-5xl sm:text-6xl mb-2 flex justify-center">{getPainEmoji(worstEva as PainLevel)}</div>
                        <div className={`text-4xl sm:text-5xl font-bold w-full flex justify-center ${getPainColor(worstEva as PainLevel)}`}>
                          {worstEva}/10
                        </div>
                      </div>
                    )}
                    {currentEva !== null && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                        <p className="text-base sm:text-lg text-gray-700 mb-2 font-semibold w-full">Actual</p>
                        <div className="text-5xl sm:text-6xl mb-2 flex justify-center">{getPainEmoji(currentEva)}</div>
                        <div className="text-4xl sm:text-5xl font-bold text-blue-600 w-full flex justify-center">
                          {currentEva}/10
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mapa de calor (imágenes frente/espalda) */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl">
                    <p
                      className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center"
                      tabIndex={0}
                      onFocus={() => speakNatural('Mapa de calor')}
                    >
                      Mapa de calor
                    </p>
                    <div className="flex gap-2 justify-center mb-4">
                      <Button
                        variant={heatmapView === 'frente' ? 'default' : 'outline'}
                        onClick={() => setHeatmapView('frente')}
                        onFocus={() => speakNatural('Frente')}
                        className="font-semibold"
                      >
                        Frente
                      </Button>
                      <Button
                        variant={heatmapView === 'espalda' ? 'default' : 'outline'}
                        onClick={() => setHeatmapView('espalda')}
                        onFocus={() => speakNatural('Espalda')}
                        className="font-semibold"
                      >
                        Espalda
                      </Button>
                    </div>
                    <div className="bg-white rounded-xl p-4 min-h-[320px] flex items-center justify-center">
                      <img
                        src={heatmapView === 'frente' ? '/images/heatmap-espalda.png' : '/images/heatmap-frente.png'}
                        alt={heatmapView === 'frente' ? 'Mapa de calor frente' : 'Mapa de calor espalda'}
                        className="max-w-full h-auto max-h-[400px] object-contain"
                      />
                    </div>
                    {lastRecord && (
                      <div
                        className="mt-4 text-center cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-lg p-2"
                        tabIndex={0}
                        onFocus={() =>
                          speakNatural(
                            `Último registro: ${lastRecord.location}, ${lastRecord.type}. ${new Date(lastRecord.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}.`
                          )
                        }
                      >
                        <p className="text-lg sm:text-xl text-gray-600">
                          Último registro: {lastRecord.location} · {lastRecord.type}
                        </p>
                        <p className="text-base sm:text-lg text-gray-500 mt-1">
                          {new Date(lastRecord.date).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div
                    className="cursor-pointer focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none rounded-xl p-4"
                    tabIndex={0}
                    onFocus={() =>
                      speakNatural(
                        'Evolución del dolor. No hay registros todavía. La evolución se mostrará cuando registres tu dolor.'
                      )
                    }
                  >
                    <p className="text-2xl sm:text-3xl text-gray-500 mb-4">
                      No hay registros de dolor
                    </p>
                    <p className="text-xl sm:text-2xl text-gray-400">
                      La evolución se mostrará cuando registres tu dolor
                    </p>
                  </div>
                  {/* Mapa de calor igualmente visible */}
                  <div className="mt-8 bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-2xl">
                    <p
                      className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 text-center"
                      tabIndex={0}
                      onFocus={() => speakNatural('Mapa de calor')}
                    >
                      Mapa de calor
                    </p>
                    <div className="flex gap-2 justify-center mb-4">
                      <Button
                        variant={heatmapView === 'frente' ? 'default' : 'outline'}
                        onClick={() => setHeatmapView('frente')}
                        onFocus={() => speakNatural('Frente')}
                        className="font-semibold"
                      >
                        Frente
                      </Button>
                      <Button
                        variant={heatmapView === 'espalda' ? 'default' : 'outline'}
                        onClick={() => setHeatmapView('espalda')}
                        onFocus={() => speakNatural('Espalda')}
                        className="font-semibold"
                      >
                        Espalda
                      </Button>
                    </div>
                    <div className="bg-white rounded-xl p-4 min-h-[320px] flex items-center justify-center">
                      <img
                        src={heatmapView === 'frente' ? '/images/heatmap-espalda.png' : '/images/heatmap-frente.png'}
                        alt={heatmapView === 'frente' ? 'Mapa de calor frente' : 'Mapa de calor espalda'}
                        className="max-w-full h-auto max-h-[400px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
