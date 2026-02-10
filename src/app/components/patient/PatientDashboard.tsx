import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Patient, MedicationRecord } from '@/app/types';
import { getPatientRecords } from '@/app/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot, Label } from 'recharts';
import { Calendar, Plus, LogOut, AlertTriangle, CalendarCheck, Activity, User, CheckCircle, Mic } from 'lucide-react';
import { MedicationsSection } from './MedicationsSection';
import { connectGeminiLive, type ConnectionStatus } from '@/app/utils/geminiLive';
import { speakNatural } from '@/app/utils/speech';

interface PatientDashboardProps {
  patient: Patient;
  hasRegisteredMedicationToday?: boolean;
  hasRequestedUrgentAppointment?: boolean;
  onUrgentRequestSent?: () => void;
  onMedicationRecord?: (record: MedicationRecord) => void;
  onNewRecord: () => void;
  onRegisterPain?: () => void;
  onLogout: () => void;
  onViewProfile?: () => void;
  /** Props del asistente de voz (compartido con el FAB en otras pantallas) */
  assistantStatus?: ConnectionStatus;
  assistantError?: string | null;
  disconnectAssistant?: (() => void) | null;
  onConnectAssistant?: () => void;
}

export function PatientDashboard({
  patient,
  hasRegisteredMedicationToday = false,
  hasRequestedUrgentAppointment = false,
  onUrgentRequestSent,
  onMedicationRecord,
  onNewRecord,
  onRegisterPain,
  onLogout,
  onViewProfile,
  assistantStatus: assistantStatusProp,
  assistantError: assistantErrorProp,
  disconnectAssistant: disconnectAssistantProp,
  onConnectAssistant: onConnectAssistantProp,
}: PatientDashboardProps) {
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
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Últimos 7 días para la gráfica
  const lastWeekRecords = sortedRecords.slice(-7).map(record => ({
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

  // Patrón de dolor según OMS (últimos 7 días): max EVA clasifica el escalón
  type PainPattern = 'Leve' | 'Moderado' | 'Severo' | 'Refractario';
  const getPainPattern = (): { pattern: PainPattern; maxEva: number } => {
    if (sortedRecords.length === 0) return { pattern: 'Leve', maxEva: 0 };
    const last7 = sortedRecords.slice(-7);
    const maxEva = Math.max(...last7.map((r) => r.painLevel));
    if (maxEva <= 3) return { pattern: 'Leve', maxEva };
    if (maxEva <= 6) return { pattern: 'Moderado', maxEva };
    return { pattern: 'Severo', maxEva }; // EVA 7-10; Refractario se reserva para fallo de tratamiento previo
  };

  const { pattern: painPattern, maxEva } = getPainPattern();
  // Solo habilitar "Solicitar cita urgente" cuando patrón Severo (EVA 7-10) – alerta dolor crítico
  const needsAppointment = painPattern === 'Severo';

  // Verificar si hace tiempo que no registra
  const daysWithoutRecord = () => {
    if (records.length === 0) return 0;
    const lastRecord = records[records.length - 1];
    const daysDiff = Math.floor((Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const feeling = getFeelingSummary();
  const daysSinceLastRecord = daysWithoutRecord();

  // Solo se puede registrar dolor una vez al día
  const today = new Date();
  const toDateString = (d: Date) => d.toISOString().slice(0, 10);
  const hasRegisteredToday = records.some((r) => toDateString(new Date(r.date)) === toDateString(today));

  // Asistente de voz: usar props si vienen de App (flujo con contexto), si no estado local
  const [localStatus, setLocalStatus] = useState<ConnectionStatus>('idle');
  const [localError, setLocalError] = useState<string | null>(null);
  const [localDisconnect, setLocalDisconnect] = useState<(() => void) | null>(null);
  const assistantStatus = assistantStatusProp ?? localStatus;
  const assistantError = assistantErrorProp ?? localError;
  const disconnectAssistant = disconnectAssistantProp ?? localDisconnect;
  const handleConnectAssistantLocal = useCallback(() => {
    if (localDisconnect) {
      localDisconnect();
      setLocalDisconnect(null);
      setLocalError(null);
      return;
    }
    setLocalError(null);
    connectGeminiLive({
      onStatus: (s) => setLocalStatus(s),
      onError: (msg) => setLocalError(msg),
    }).then((disconnect) => setLocalDisconnect(() => disconnect));
  }, [localDisconnect]);
  const handleConnectAssistant = onConnectAssistantProp ?? handleConnectAssistantLocal;

  const [showUrgentSentDialog, setShowUrgentSentDialog] = useState(false);
  const urgentReadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Leer en voz alta el contenido del modal cuando se abre (Solicitar cita urgente)
  useEffect(() => {
    if (showUrgentSentDialog) {
      speakNatural(
        'Mensaje enviado. Se enviaron tus datos a la clínica. Te contactarán pronto para registrar tu cita y darte todos los detalles.'
      );
    }
  }, [showUrgentSentDialog]);

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
        {/* Saludo con micrófono morado animado (único control del asistente en esta pantalla) */}
        <div className="mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-[hsl(270,81%,40%)] mb-0">
            Hola, {patient.name}
          </h1>
          <button
            type="button"
            onClick={() => onConnectAssistantProp?.()}
            className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[hsl(270,70%,55%)] shadow-[0_0_28px_rgba(147,51,234,0.5)] flex items-center justify-center hover:bg-[hsl(270,70%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(270,70%,75%)] assistant-mic-pulse"
            aria-label="Asistente de voz"
          >
            <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </button>
        </div>
        {assistantStatus === 'connected' && (
          <p className="text-base sm:text-lg text-green-700 font-medium -mt-4 mb-2">Conectado. Habla ahora. Toca el micrófono de nuevo para desconectar.</p>
        )}
        {assistantError && (
          <Alert className="mb-4 border-amber-500 bg-amber-50">
            <AlertDescription className="text-sm text-amber-800">{assistantError}</AlertDescription>
          </Alert>
        )}
        <p className="text-xl sm:text-3xl text-gray-700 -mt-2 mb-6 sm:mb-8">¿Cómo te sientes hoy?</p>

        {/* Alertas y notificaciones inteligentes */}
        {needsAppointment && (
          <Alert className="mb-4 sm:mb-6 border-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            <AlertDescription className="text-lg sm:text-2xl font-semibold text-red-900 ml-2">
              Tu dolor ha subido esta semana. Más abajo te decimos qué hacer y puedes pedir cita urgente si la necesitas.
            </AlertDescription>
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
                  
                  {/* Botón de nuevo registro (solo una vez al día) */}
                  <Button
                    onClick={onNewRecord}
                    onFocus={() => !hasRegisteredToday && speakNatural('Registrar cómo me siento')}
                    disabled={hasRegisteredToday}
                    className="w-full h-14 sm:h-16 lg:h-20 px-4 sm:px-6 lg:px-8 text-lg sm:text-xl lg:text-lg font-bold bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:to-[hsl(270,70%,40%)] shadow-[0_0_20px_rgba(147,51,234,0.6),0_4px_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8),0_6px_20px_rgba(147,51,234,0.6)] disabled:opacity-60 disabled:cursor-not-allowed disabled:grayscale"
                  >
                    {hasRegisteredToday ? 'Ya registraste hoy' : 'Registrar cómo me siento'}
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

          {/* Sección de Medicamentos */}
          {patient.medications && patient.medications.length > 0 && (
            <MedicationsSection
                medications={patient.medications}
                hasRegisteredMedicationToday={hasRegisteredMedicationToday}
                onMedicationRecord={(record: MedicationRecord) => {
                  onMedicationRecord?.(record);
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
                  {onRegisterPain && (
                    <Button
                      onClick={onRegisterPain}
                      disabled={hasRegisteredToday}
                      className="w-full min-h-14 sm:min-h-16 py-3 px-4 text-base sm:text-lg font-semibold bg-green-600 hover:bg-green-700 mt-4 sm:mt-6 shadow-[0_0_20px_rgba(22,163,74,0.6),0_4px_15px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.8),0_6px_20px_rgba(22,163,74,0.6)] text-white disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-green-400 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center whitespace-normal leading-tight"
                    >
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span>
                        {hasRegisteredToday
                          ? 'Ya registraste tu dolor antes de la consulta hoy'
                          : 'Registra tu dolor antes de la consulta'}
                      </span>
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
                <LineChart data={lastWeekRecords} margin={{ top: 40, right: 30, left: 20, bottom: 40 }}>
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

            {/* Solo la recomendación del patrón actual, en lenguaje sencillo para adultos mayores */}
            {lastWeekRecords.length > 0 && (
              <div className="mt-6 sm:mt-8 pt-6 border-t-2 border-slate-200">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 mb-4">
                  Cómo vas esta semana
                </h3>
                {painPattern === 'Leve' && (
                  <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed">
                    Tu dolor está en un nivel bajo. Lo que tomas para el dolor parece estar ayudando. Sigue con tu tratamiento y no dejes de registrar cómo te sientes.
                  </p>
                )}
                {painPattern === 'Moderado' && (
                  <p className="text-xl sm:text-2xl text-gray-700 leading-relaxed">
                    Tu dolor está en un nivel medio. Es buen momento para que el médico revise tu medicación en la próxima cita. Sigue registrando cómo te sientes.
                  </p>
                )}
                {painPattern === 'Severo' && (
                  <>
                    <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 mb-4 leading-relaxed">
                      Tu dolor ha subido mucho esta semana. Es importante que la clínica te vea pronto. Abajo puedes pedir una cita urgente para que te atiendan antes.
                    </p>
                    {hasRequestedUrgentAppointment ? (
                      <Button
                        disabled
                        className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-bold bg-purple-300 text-white cursor-not-allowed opacity-90"
                      >
                        Ya solicitaste cita urgente
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => setShowUrgentSentDialog(true)}
                          onFocus={() => {
                            if (urgentReadTimeoutRef.current) clearTimeout(urgentReadTimeoutRef.current);
                            urgentReadTimeoutRef.current = setTimeout(() => {
                              speakNatural('Solicitar cita urgente');
                              urgentReadTimeoutRef.current = null;
                            }, 4000);
                          }}
                          onBlur={() => {
                            if (urgentReadTimeoutRef.current) {
                              clearTimeout(urgentReadTimeoutRef.current);
                              urgentReadTimeoutRef.current = null;
                            }
                          }}
                          className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-bold bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          SOLICITAR CITA URGENTE
                        </Button>
                        <p className="text-base sm:text-lg text-gray-500 mt-2">
                          Al presionar, la clínica sabrá que necesitas ser atendido pronto.
                        </p>
                      </>
                    )}
                    <Dialog open={showUrgentSentDialog} onOpenChange={setShowUrgentSentDialog}>
                      <DialogContent className="sm:max-w-md">
                        <div className="flex justify-center mb-2">
                          <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-green-500" aria-hidden />
                        </div>
                        <DialogHeader>
                          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">
                            Mensaje enviado
                          </DialogTitle>
                        </DialogHeader>
                        <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 text-center leading-relaxed py-2">
                          Se enviaron tus datos a la clínica. Te contactarán pronto para registrar tu cita y darte todos los detalles.
                        </p>
                        <DialogFooter className="sm:justify-center">
                          <Button
                            onClick={() => {
                              onUrgentRequestSent?.();
                              setShowUrgentSentDialog(false);
                            }}
                            className="text-lg sm:text-xl font-semibold h-14 sm:h-16 px-8 bg-[hsl(270,55%,65%)] hover:bg-[hsl(270,55%,55%)] text-white"
                          >
                            Entendido
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style>{`
        @keyframes assistant-mic-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(147,51,234,0.4); }
          50% { transform: scale(1.08); box-shadow: 0 0 32px rgba(147,51,234,0.6); }
        }
        .assistant-mic-pulse {
          animation: assistant-mic-pulse 2.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
