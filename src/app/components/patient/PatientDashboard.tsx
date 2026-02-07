import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Patient } from '@/app/types';
import { getPatientRecords } from '@/app/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Plus, LogOut, AlertTriangle, CalendarCheck, Activity, User } from 'lucide-react';

interface PatientDashboardProps {
  patient: Patient;
  onNewRecord: () => void;
  onLogout: () => void;
  onViewProfile?: () => void;
}

export function PatientDashboard({ patient, onNewRecord, onLogout, onViewProfile }: PatientDashboardProps) {
  // Validar que patient existe
  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl text-gray-500 mb-4">Error: No se encontró información del paciente</p>
        </div>
      </div>
    );
  }

  const records = getPatientRecords(patient.dni);
  
  // Obtener últimos 7 días
  const lastWeekRecords = records.slice(-7).map(record => ({
    date: new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    nivel: record.painLevel,
  }));

  const getPainColor = (level: number) => {
    if (level <= 2) return '#22c55e'; // green
    if (level <= 5) return '#eab308'; // yellow
    if (level <= 7) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getFeelingSummary = () => {
    if (records.length === 0) return { text: 'No tienes registros aún', emoji: '📝' };
    const lastRecord = records[records.length - 1];
    if (lastRecord.painLevel <= 2) return { text: 'Te sientes bien', emoji: '😊' };
    if (lastRecord.painLevel <= 5) return { text: 'Tienes molestias leves', emoji: '😐' };
    if (lastRecord.painLevel <= 7) return { text: 'Sientes dolor moderado', emoji: '😣' };
    return { text: 'Tienes dolor intenso', emoji: '😖' };
  };

  // Detectar si el dolor ha aumentado significativamente
  const shouldRecommendAppointment = () => {
    if (records.length < 2) return false;
    const lastRecord = records[records.length - 1];
    const previousRecord = records[records.length - 2];
    return lastRecord.painLevel >= 7 || (lastRecord.painLevel - previousRecord.painLevel >= 3);
  };

  // Verificar si hace tiempo que no registra
  const daysWithoutRecord = () => {
    if (records.length === 0) return 0;
    const lastRecord = records[records.length - 1];
    const daysDiff = Math.floor((Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const feeling = getFeelingSummary();
  const needsAppointment = shouldRecommendAppointment();
  const daysSinceLastRecord = daysWithoutRecord();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con logo */}
        <div className="flex justify-between items-start mb-6 sm:mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-blue-900">PainTrack CIMED</h2>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-blue-900 mb-2">
              Hola, {patient.name}
            </h1>
            <p className="text-xl sm:text-3xl text-gray-700">¿Cómo te sientes hoy?</p>
          </div>
          <div className="flex flex-col gap-2">
            {onViewProfile && (
              <Button
                onClick={onViewProfile}
                variant="outline"
                className="h-12 sm:h-16 px-4 sm:px-8 text-base sm:text-xl font-bold"
              >
                <User className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
                PERFIL
              </Button>
            )}
            <Button
              onClick={onLogout}
              variant="outline"
              className="h-12 sm:h-16 px-4 sm:px-8 text-base sm:text-xl font-bold"
            >
              <LogOut className="w-4 h-4 sm:w-6 sm:h-6 mr-2" />
              SALIR
            </Button>
          </div>
        </div>

        {/* Alertas y notificaciones inteligentes */}
        {needsAppointment && (
          <Alert className="mb-4 sm:mb-6 border-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <AlertDescription className="text-lg sm:text-2xl font-semibold text-red-900 ml-2 mb-4">
              Tu dolor ha aumentado significativamente. Te recomendamos agendar una cita médica.
            </AlertDescription>
            <Button
              className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-bold bg-red-600 hover:bg-red-700 shadow-xl"
            >
              SOLICITAR CITA
            </Button>
          </Alert>
        )}

        {daysSinceLastRecord >= 1 && !needsAppointment && (
          <Alert className="mb-4 sm:mb-6 border-2 border-blue-500 bg-blue-50">
            <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <AlertDescription className="text-lg sm:text-2xl font-semibold text-blue-900 ml-2">
              {daysSinceLastRecord === 1 
                ? 'No olvides registrar cómo te sientes hoy.'
                : `No olvides registrar cómo te sientes hoy. Hace ${daysSinceLastRecord} días que no registras tu dolor.`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 sm:py-8">
                <div className="text-6xl sm:text-7xl mb-3 sm:mb-4">{feeling.emoji}</div>
                <p className="text-2xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">{feeling.text}</p>
                <Button
                  onClick={onNewRecord}
                  className="w-full h-20 sm:h-24 text-2xl sm:text-3xl font-bold bg-blue-600 hover:bg-blue-700 mt-2 sm:mt-4"
                >
                  <Plus className="w-8 h-8 sm:w-10 sm:h-10 mr-2 sm:mr-3" />
                  NUEVO REGISTRO
                </Button>
              </div>
            </CardContent>
          </Card>

          {patient.nextAppointment && (
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                  Próxima Cita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 sm:py-8">
                  <p className="text-xl sm:text-2xl text-gray-600 mb-3 sm:mb-4">Tu próxima cita es:</p>
                  <div className="bg-purple-50 p-4 sm:p-6 rounded-xl">
                    <p className="text-3xl sm:text-4xl font-bold text-purple-700">
                      {patient.nextAppointment.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  {needsAppointment && (
                    <Button
                      className="w-full h-16 sm:h-20 text-xl sm:text-2xl font-bold bg-purple-600 hover:bg-purple-700 mt-4 sm:mt-6"
                    >
                      SOLICITAR CITA URGENTE
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
              Evolución de la Última Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastWeekRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
                <BarChart data={lastWeekRecords}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    domain={[0, 10]}
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  />
                  <Tooltip 
                    contentStyle={{ fontSize: '20px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '18px' }}
                  />
                  <Bar dataKey="nivel" radius={[8, 8, 0, 0]}>
                    {lastWeekRecords.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getPainColor(entry.nivel)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <p className="text-2xl sm:text-3xl text-gray-500">
                  Aún no tienes registros esta semana
                </p>
                <p className="text-xl sm:text-2xl text-gray-400 mt-3 sm:mt-4">
                  Presiona "NUEVO REGISTRO" para comenzar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
