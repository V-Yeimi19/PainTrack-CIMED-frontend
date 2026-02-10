import { useState, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Patient, MedicationRecord } from '@/app/types';
import { getPatientRecords } from '@/app/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot, Label } from 'recharts';
import { Calendar, Plus, LogOut, AlertTriangle, CalendarCheck, Activity, User, Mic, MicOff } from 'lucide-react';
import { MedicationsSection } from './MedicationsSection';
import { connectGeminiLive, type ConnectionStatus } from '@/app/utils/geminiLive';

interface PatientDashboardProps {
  patient: Patient;
  onNewRecord: () => void;
  onRegisterPain?: () => void;
  onLogout: () => void;
  onViewProfile?: () => void;
}

export function PatientDashboard({ patient, onNewRecord, onRegisterPain, onLogout, onViewProfile }: PatientDashboardProps) {
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
    if (lastRecord.painLevel <= 2) return { text: 'Tu registro nos ayuda a acompañarte mejor.', emoji: '😊' };
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

  // Asistente de voz Gemini (CIMED)
  const [assistantStatus, setAssistantStatus] = useState<ConnectionStatus>('idle');
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [disconnectAssistant, setDisconnectAssistant] = useState<(() => void) | null>(null);

  const handleConnectAssistant = useCallback(() => {
    if (disconnectAssistant) {
      disconnectAssistant();
      setDisconnectAssistant(null);
      setAssistantError(null);
      return;
    }
    setAssistantError(null);
    connectGeminiLive({
      onStatus: (status) => setAssistantStatus(status),
      onError: (msg) => setAssistantError(msg),
    }).then((disconnect) => {
      setDisconnectAssistant(() => disconnect);
    });
  }, [disconnectAssistant]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado fijo */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo a la izquierda */}
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/images/logo-cimed.png" 
                alt="PainTrack CIMED Logo" 
                className="h-10 sm:h-12 w-auto object-contain"
              />
              <div className="flex flex-col">
                <h2 className="text-xl sm:text-2xl font-bold text-[hsl(270,81%,40%)] leading-tight">PainTrack</h2>
                <h3 className="text-sm sm:text-base text-[hsl(270,81%,56%)] leading-tight">CIMED</h3>
              </div>
            </div>
            {/* Botones a la derecha */}
            <div className="flex flex-row gap-2">
              {onViewProfile && (
                <Button
                  onClick={onViewProfile}
                  className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base font-bold bg-[hsl(270,70%,60%)] hover:bg-[hsl(270,70%,55%)] text-white border-0"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  PERFIL
                </Button>
              )}
              <Button
                onClick={onLogout}
                className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base font-bold bg-[hsl(0,70%,60%)] hover:bg-[hsl(0,70%,55%)] text-white border-0"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                SALIR
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {/* Saludo */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold text-[hsl(270,81%,40%)] mb-2">
            Hola, {patient.name}
          </h1>
          <p className="text-xl sm:text-3xl text-gray-700">¿Cómo te sientes hoy?</p>
        </div>

        {/* Alertas y notificaciones inteligentes */}
        {needsAppointment && (
          <Alert className="mb-4 sm:mb-6 border-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <AlertDescription className="text-lg sm:text-2xl font-semibold text-red-900 ml-2 mb-4">
              Tu dolor ha aumentado significativamente. Te recomendamos agendar una cita médica.
            </AlertDescription>
            <Button
              className="w-full h-16 sm:h-40 text-xl sm:text-2xl font-bold bg-red-30 hover:bg-red-700 shadow-x2"
            >
              SOLICITAR CITA
            </Button>
          </Alert>
        )}

        {daysSinceLastRecord >= 1 && !needsAppointment && (
          <Alert className="mb-4 sm:mb-6 border-2 border-[hsl(270,81%,56%)] bg-[hsl(270,81%,98%)]">
            <CalendarCheck className="h-6 w-6 sm:h-8 sm:w-8 text-[hsl(270,81%,56%)]" />
            <AlertDescription className="text-lg sm:text-2xl font-semibold text-[hsl(270,81%,40%)] ml-2">
              {daysSinceLastRecord === 1 
                ? 'No olvides registrar cómo te sientes hoy.'
                : `No olvides registrar cómo te sientes hoy. Hace ${daysSinceLastRecord} días que no registras tu dolor.`}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[hsl(270,81%,96%)] to-[hsl(270,81%,98%)] pb-4">
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[hsl(270,81%,40%)] text-center">
                <span className="block sm:hidden">
                  ¿Quieres contarnos cómo<br />te sientes hoy?
                </span>
                <span className="hidden sm:inline">
                  ¿Quieres contarnos cómo te sientes hoy?
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-row items-start gap-3 sm:gap-4 lg:gap-8">
                {/* Contenido izquierdo */}
                <div className="flex-1 flex flex-col justify-between min-w-0 overflow-visible">
                  {/* Texto del estado */}
                  <div className="text-left mb-6 sm:mb-8 lg:mb-10">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
                      {feeling.text}
                    </p>
                    {records.length > 0 && (
                      <p className="text-lg sm:text-lg lg:text-xl text-gray-600">
                        Último registro: {new Date(records[records.length - 1].date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    )}
                  </div>
                  
                  {/* Botón de nuevo registro */}
                  <Button
                    onClick={onNewRecord}
                    className="w-full h-14 sm:h-16 lg:h-20 px-4 sm:px-6 lg:px-8 text-lg sm:text-xl lg:text-lg font-bold bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:to-[hsl(270,70%,40%)] shadow-[0_0_20px_rgba(147,51,234,0.6),0_4px_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8),0_6px_20px_rgba(147,51,234,0.6)]"
                  >
                    Registrar cómo me siento
                  </Button>
                </div>
                
                {/* Imagen de dolor crónico - lado derecho */}
                <div className="w-32 sm:w-40 lg:w-48 flex-shrink-0 flex items-center justify-center">
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg w-full h-[200px] sm:h-[240px] lg:h-[360px]">
                    <img 
                      src="/images/dolor-cronico.jpg" 
                      alt="Estado de dolor"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asistente de voz IA (Gemini + CIMED) */}
          <Card className="shadow-xl overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-[hsl(270,81%,90%)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl sm:text-2xl font-bold text-[hsl(270,81%,40%)] flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Asistente de voz
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-base text-gray-700 mb-4">
                Habla con el asistente para dudas sobre el registro de dolor o tipos de dolor.
              </p>
              {assistantError && (
                <Alert className="mb-4 border-amber-500 bg-amber-50">
                  <AlertDescription className="text-sm text-amber-800">{assistantError}</AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleConnectAssistant}
                disabled={assistantStatus === 'connecting'}
                className="w-full h-12 sm:h-14 text-base font-bold bg-[hsl(270,70%,50%)] hover:bg-[hsl(270,70%,45%)] text-white"
              >
                {assistantStatus === 'connecting' && 'Conectando…'}
                {disconnectAssistant != null && assistantStatus === 'connected' && (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    Desconectar
                  </>
                )}
                {!disconnectAssistant && assistantStatus !== 'connecting' && (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    {assistantStatus === 'error' ? 'Reintentar' : 'Hablar con Asistente IA'}
                  </>
                )}
              </Button>
              {assistantStatus === 'connected' && (
                <p className="text-sm text-green-700 mt-3 font-medium">Conectado. Habla ahora.</p>
              )}
            </CardContent>
          </Card>

          {/* Sección de Medicamentos */}
          {patient.medications && patient.medications.length > 0 && (
            <MedicationsSection
                medications={patient.medications}
                onMedicationRecord={(record: MedicationRecord) => {
                  // Aquí puedes guardar el registro de medicamento
                  console.log('Medication record:', record);
                }}
              />
          )}

          {patient.nextAppointment && (
            <Card className="shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                <CardTitle className="text-2xl sm:text-3xl font-bold text-green-700 flex items-center gap-2 sm:gap-3">
                  <Calendar className="w-8 h-8 sm:w-10 sm:h-10" />
                  Próxima Cita
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="text-center py-6 sm:py-8">
                  <p className="text-xl sm:text-2xl text-gray-600 mb-3 sm:mb-4">Tu próxima cita es:</p>
                  <div className="bg-green-50 p-4 sm:p-6 rounded-xl border-2 border-green-100">
                    <p className="text-3xl sm:text-4xl font-bold text-green-700">
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
                  {onRegisterPain && (
                    <Button
                      onClick={onRegisterPain}
                      className="w-full h-14 sm:h-16 text-lg sm:text-xl font-semibold bg-green-600 hover:bg-green-700 mt-4 sm:mt-6 shadow-[0_0_20px_rgba(22,163,74,0.6),0_4px_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.8),0_6px_20px_rgba(22,163,74,0.6)] text-white"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      REGISTRAR DOLOR PRE-CONSULTA
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
                <LineChart data={lastWeekRecords} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  >
                    <Label value="Días" offset={10} position="bottom" style={{ fontSize: '18px', fontWeight: 'bold' }} />
                  </XAxis>
                  <YAxis 
                    domain={[0, 10]}
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  >
                    <Label value="Intensidad del dolor" angle={-90} position="left" style={{ fontSize: '18px', fontWeight: 'bold', textAnchor: 'middle' }} />
                  </YAxis>
                  <Tooltip 
                    contentStyle={{ fontSize: '20px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '18px' }}
                    formatter={(value: any) => [`${value}/10`, 'Intensidad']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="nivel" 
                    stroke="#cbd5e1" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={(props: any) => {
                      const { cx, cy, payload } = props;
                      return (
                        <Dot 
                          cx={cx} 
                          cy={cy} 
                          r={8} 
                          fill={getPainColor(payload.nivel)}
                          stroke={getPainColor(payload.nivel)}
                          strokeWidth={3}
                        />
                      );
                    }}
                    label={(props: any) => {
                      const { x, y, value } = props;
                      return (
                        <text 
                          x={x} 
                          y={y - 15} 
                          fill={getPainColor(value)} 
                          fontSize={18} 
                          fontWeight="bold" 
                          textAnchor="middle"
                        >
                          {value}
                        </text>
                      );
                    }}
                  />
                </LineChart>
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
