import { useState, useEffect, useRef } from 'react';
import { Login } from '@/app/components/Login';
import { Welcome } from '@/app/components/patient/Welcome';
import { PainLevelSelector } from '@/app/components/patient/PainLevelSelector';
import { PainLocationSelector } from '@/app/components/patient/PainLocationSelector';
import { PainTypeSelector } from '@/app/components/patient/PainTypeSelector';
import { Confirmation } from '@/app/components/patient/Confirmation';
import { ThankYou } from '@/app/components/patient/ThankYou';
import { AssistantIntro } from '@/app/components/patient/AssistantIntro';
import { RegistrationSummary } from '@/app/components/patient/RegistrationSummary';
import { PatientDashboard } from '@/app/components/patient/PatientDashboard';
import { PatientProfile } from '@/app/components/patient/PatientProfile';
import { DoctorDashboard } from '@/app/components/doctor/DoctorDashboard';
import { Patient, Doctor, PainLevel, PainLocation, PainType, MedicationRecord } from '@/app/types';
import { addPainRecord, getPatientRecords, updatePatient } from '@/app/data/mockData';
import { CustomPoint } from '@/app/components/patient/BodyMap';
import { connectGeminiLive, updateAssistantContext, sendPreconsultContextReset, type ConnectionStatus } from '@/app/utils/geminiLive';
import { VoiceAssistantFab } from '@/app/components/patient/VoiceAssistantFab';

// Claves para localStorage
const STORAGE_KEY_CUSTOM_POINTS = 'painTrack_customPoints';
const STORAGE_KEY_REGISTERED_LOCATIONS = 'painTrack_registeredLocations';

/** En desarrollo, limpia estado que bloquea botones (medicación y cita urgente) para que aparezcan desbloqueados al probar */
function clearDevBlockingState() {
  if (import.meta.env.DEV) {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('painTrack_urgentRequestSent_') || key.startsWith('painTrack_medicationRecords_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Error limpiando estado de bloqueo en dev:', e);
    }
  }
}

// Funciones helper para localStorage
const saveCustomPointsToStorage = (points: CustomPoint[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_POINTS, JSON.stringify(points));
  } catch (error) {
    console.warn('Error guardando puntos personalizados en localStorage:', error);
  }
};

const loadCustomPointsFromStorage = (): CustomPoint[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_POINTS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error cargando puntos personalizados desde localStorage:', error);
  }
  return [];
};

const saveRegisteredLocationsToStorage = (locations: PainLocation[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_REGISTERED_LOCATIONS, JSON.stringify(locations));
  } catch (error) {
    console.warn('Error guardando ubicaciones registradas en localStorage:', error);
  }
};

const loadRegisteredLocationsFromStorage = (): PainLocation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_REGISTERED_LOCATIONS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error cargando ubicaciones registradas desde localStorage:', error);
  }
  return [];
};

const clearPainRegistrationStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_POINTS);
    localStorage.removeItem(STORAGE_KEY_REGISTERED_LOCATIONS);
  } catch (error) {
    console.warn('Error limpiando localStorage:', error);
  }
};

// Registros de medicación por paciente (localStorage por DNI)
const getMedicationRecordsStorageKey = (dni: string) => `painTrack_medicationRecords_${dni}`;

function getMedicationRecordsFromStorage(dni: string): MedicationRecord[] {
  try {
    const stored = localStorage.getItem(getMedicationRecordsStorageKey(dni));
    if (stored) {
      const parsed = JSON.parse(stored) as (Omit<MedicationRecord, 'date'> & { date: string })[];
      return parsed.map((r) => ({ ...r, date: new Date(r.date) }));
    }
  } catch (e) {
    console.warn('Error leyendo registros de medicación:', e);
  }
  return [];
}

function saveMedicationRecordToStorage(dni: string, record: MedicationRecord): void {
  const list = getMedicationRecordsFromStorage(dni);
  list.push(record);
  try {
    localStorage.setItem(getMedicationRecordsStorageKey(dni), JSON.stringify(list));
  } catch (e) {
    console.warn('Error guardando registro de medicación:', e);
  }
}

/** True si hoy hay al menos un registro por cada medicamento activo (todos respondidos). */
function hasRegisteredMedicationToday(dni: string, activeMedicationIds: string[]): boolean {
  if (activeMedicationIds.length === 0) return false;
  const todayRecords = getMedicationRecordsFromStorage(dni).filter((r) => isToday(new Date(r.date)));
  const recordedIds = new Set(todayRecords.map((r) => r.medicationId));
  return activeMedicationIds.every((id) => recordedIds.has(id));
}

// Cita urgente solicitada (por paciente DNI) – para bloquear botón y contexto del asistente
const getUrgentRequestStorageKey = (dni: string) => `painTrack_urgentRequestSent_${dni}`;

function getUrgentRequestSentFromStorage(dni: string): boolean {
  try {
    return localStorage.getItem(getUrgentRequestStorageKey(dni)) === '1';
  } catch {
    return false;
  }
}

function setUrgentRequestSentToStorage(dni: string): void {
  try {
    localStorage.setItem(getUrgentRequestStorageKey(dni), '1');
  } catch (e) {
    console.warn('Error guardando solicitud cita urgente:', e);
  }
}

type AppState = 
  | { screen: 'login' }
  | { screen: 'patient-dashboard'; patient: Patient; medicationRecordsVersion?: number; urgentRequestVersion?: number }
  | { screen: 'patient-profile'; patient: Patient }
  | { screen: 'patient-welcome'; patient: Patient }
  | { screen: 'patient-pain-location'; patient: Patient; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[]; isNewRecord?: boolean; remainingTreatedParts?: PainLocation[]; isPreConsultFlow?: boolean }
  | { screen: 'patient-pain-level'; patient: Patient; location: PainLocation; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[]; isNewRecord?: boolean; remainingTreatedParts?: PainLocation[]; isPreConsultFlow?: boolean }
  | { screen: 'patient-pain-type'; patient: Patient; location: PainLocation; painLevel: PainLevel; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[]; isNewRecord?: boolean; remainingTreatedParts?: PainLocation[]; isPreConsultFlow?: boolean }
  | { screen: 'patient-confirmation'; patient: Patient; painLevel: PainLevel; location: PainLocation; types: PainType[]; comment?: string; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[] }
  | { screen: 'patient-thank-you'; patient: Patient; remainingTreatedParts?: PainLocation[] }
  | { screen: 'patient-assistant-intro'; patient: Patient }
  | { screen: 'patient-registration-summary'; patient: Patient; location: PainLocation; painLevel: PainLevel; types: PainType[]; remainingTreatedParts?: PainLocation[]; isPreConsultFlow?: boolean }
  | { screen: 'doctor-dashboard'; doctor: Doctor };

/** Si una fecha es hoy (misma fecha local) */
function isToday(d: Date) {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

/** Contexto para el asistente de voz (pantalla actual y datos) */
function getContextFromState(state: AppState): Record<string, unknown> {
  switch (state.screen) {
    case 'patient-dashboard': {
      const records = getPatientRecords(state.patient.dni);
      const hasRegisteredPainToday = records.some((r) => isToday(new Date(r.date)));
      const activeMedicationIds = (state.patient.medications ?? []).filter((m) => m.active).map((m) => m.id);
      const hasRegisteredMedicationTodayFlag = hasRegisteredMedicationToday(state.patient.dni, activeMedicationIds);
      const medications = state.patient.medications ?? [];
      const nextApp = state.patient.nextAppointment;
      const daysUntilAppointment = nextApp
        ? Math.ceil((new Date(nextApp).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const last7 = sortedRecords.slice(-7);
      const maxEva = last7.length ? Math.max(...last7.map((r) => r.painLevel)) : 0;
      const patronSevero = maxEva >= 7;
      const yaSolicitoCitaUrgente = getUrgentRequestSentFromStorage(state.patient.dni);
      const evolucionUltimaSemana = last7.map((r) => ({
        fecha: new Date(r.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' }),
        nivel: r.painLevel,
      }));
      const textoEvolucion =
        patronSevero
          ? 'Cómo vas esta semana. Tu dolor ha subido mucho esta semana. Es importante que la clínica te vea pronto. Abajo puedes pedir una cita urgente para que te atiendan antes.'
          : maxEva <= 3
            ? 'Cómo vas esta semana. Tu dolor está en un nivel bajo. Lo que tomas para el dolor parece estar ayudando. Sigue con tu tratamiento y no dejes de registrar cómo te sientes.'
            : 'Cómo vas esta semana. Tu dolor está en un nivel medio. Es buen momento para que el médico revise tu medicación en la próxima cita. Sigue registrando cómo te sientes.';
      return {
        screen: 'Inicio (Dashboard)',
        screenId: 'patient-dashboard',
        hasRegisteredPainToday,
        puedeRegistrarDolor: !hasRegisteredPainToday,
        hasRegisteredMedicationToday: hasRegisteredMedicationTodayFlag,
        puedeRegistrarMedicamento: !hasRegisteredMedicationTodayFlag,
        tieneMedicamentos: medications.length > 0,
        nombresMedicamentos: medications.map((m) => m.name ?? m).slice(0, 10),
        proximaCita: nextApp ? new Date(nextApp).toLocaleDateString('es-ES') : null,
        diasParaProximaCita: daysUntilAppointment,
        citaCerca: daysUntilAppointment != null && daysUntilAppointment >= 0 && daysUntilAppointment <= 3,
        yaSolicitoCitaUrgente,
        patronSevero,
        textoRecomendacionEvolucion: textoEvolucion,
        evolucionGrafica: evolucionUltimaSemana,
      };
    }
    case 'patient-profile':
      return { screen: 'Perfil del paciente', screenId: 'patient-profile' };
    case 'patient-welcome':
      return { screen: 'Bienvenida al registro de dolor', screenId: 'patient-welcome', hint: 'Toque el botón para empezar.' };
    case 'patient-pain-location': {
      const esPartesEnTratamiento = (state.remainingTreatedParts?.length ?? 0) > 0;
      return {
        screen: esPartesEnTratamiento ? 'Partes en tratamiento' : '¿Dónde te duele? (Registrar dolor pre-consulta)',
        screenId: 'patient-pain-location',
        esPartesEnTratamiento,
        partesEnTratamiento: state.remainingTreatedParts ?? [],
        locationsRegistradas: state.registeredLocations?.length ?? 0,
        hint: esPartesEnTratamiento
          ? 'Solo se consideran las partes que el médico ha revisado en consulta. Seleccione una de la lista.'
          : 'Presione en el punto que le duele en el mapa. La app leerá la parte en voz alta; si es correcta pulse Confirmar. Si pulsa Otro, aparecerá un punto naranja que puede colocar en cualquier parte del cuerpo.',
      };
    }
    case 'patient-pain-level':
      return {
        screen: '¿Cuánto te duele hoy?',
        screenId: 'patient-pain-level',
        soloIntensidad: true,
        ubicacion: state.location,
        hint: 'En esta pantalla solo se elige la INTENSIDAD del dolor (escala 0, 1-2, 3-4, 5-6, 7-8, 9-10). El tipo de dolor (punzante, etc.) se elige en la siguiente pantalla "¿Cómo es tu dolor?". Si preguntan por tipo de dolor, indique que eso es en la siguiente pantalla.',
      };
    case 'patient-pain-type':
      return {
        screen: '¿Cómo es tu dolor?',
        screenId: 'patient-pain-type',
        ubicacion: state.location,
        nivelDolor: state.painLevel,
        hint: 'Puede elegir uno o varios tipos (apretado, punzante, etc.).',
      };
    case 'patient-registration-summary':
      return {
        screen: 'Resumen del registro',
        screenId: 'patient-registration-summary',
        tieneMasPartes: (state.remainingTreatedParts?.length ?? 0) > 0,
        hint: 'Puede continuar registrando otra zona o finalizar.',
      };
    case 'patient-assistant-intro': {
      const records = getPatientRecords(state.patient.dni);
      const doloresRecientes = records
        .filter((r) => isToday(new Date(r.date)))
        .map((r) => ({ ubicacion: r.location, nivel: r.painLevel, tipo: r.type }));
      const ubicacionesDolor = [...new Set(doloresRecientes.map((d) => d.ubicacion))];
      return {
        screen: 'Cuestionario preconsulta con el asistente',
        screenId: 'patient-assistant-intro',
        modo: 'cuestionario_preconsulta',
        hint: 'Conversación para obtener datos para el médico. Toque el micrófono para hablar.',
        doloresRegistrados: ubicacionesDolor,
        cantidadDolores: ubicacionesDolor.length,
        datosPaciente: {
          ocupacion: state.patient.occupation,
          numeroHijos: state.patient.numberOfChildren,
        },
      };
    }
    case 'patient-thank-you':
      return { screen: 'Gracias', screenId: 'patient-thank-you', hint: 'Toque para volver al inicio.' };
    case 'patient-confirmation':
      return {
        screen: 'Confirmar registro',
        screenId: 'patient-confirmation',
        ubicacion: state.location,
        nivelDolor: state.painLevel,
        tipos: state.types,
      };
    default:
      return { screenId: state.screen };
  }
}

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'login' });

  // Asistente de voz (compartido entre dashboard y FAB en otras pantallas)
  const [assistantStatus, setAssistantStatus] = useState<ConnectionStatus>('idle');
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantTranscription, setAssistantTranscription] = useState<string | null>(null);
  const [disconnectAssistant, setDisconnectAssistant] = useState<(() => void) | null>(null);
  /** Buffer de transcripción: solo mostramos cuando hay una frase completa (para dar tiempo a leer) */
  const transcriptionPendingRef = useRef('');

  const handleConnectAssistant = () => {
    if (disconnectAssistant) {
      const pending = transcriptionPendingRef.current.trim();
      if (pending) {
        setAssistantTranscription((prev) => (prev ? prev + ' ' + pending : pending));
      }
      transcriptionPendingRef.current = '';
      disconnectAssistant();
      setDisconnectAssistant(null);
      setAssistantError(null);
      return;
    }
    setAssistantError(null);
    setAssistantTranscription(null);
    transcriptionPendingRef.current = '';
    connectGeminiLive({
      onStatus: (s) => setAssistantStatus(s),
      onError: (msg) => setAssistantError(msg),
      // Mostrar una frase completa a la vez; después de un tiempo se desvanece para mostrar la siguiente
      onTranscription: (text) => {
        const pending = (transcriptionPendingRef.current + (transcriptionPendingRef.current ? ' ' : '') + text).trim();
        transcriptionPendingRef.current = pending;
        const lastEnd = Math.max(pending.lastIndexOf('.'), pending.lastIndexOf('!'), pending.lastIndexOf('?'));
        const wordCount = pending.split(/\s+/).filter(Boolean).length;
        const hasFullPhrase = lastEnd >= 0 || wordCount >= 7;
        if (hasFullPhrase) {
          const toShow = lastEnd >= 0 ? pending.slice(0, lastEnd + 1) : pending;
          const rest = (lastEnd >= 0 ? pending.slice(lastEnd + 1).trim() : '');
          transcriptionPendingRef.current = rest;
          setAssistantTranscription(toShow);
        }
      },
    }).then((disconnect) => setDisconnectAssistant(() => disconnect));
  };

  // En desarrollo: al cargar la app, limpiar estado que bloquea botones para que aparezcan desbloqueados
  useEffect(() => {
    clearDevBlockingState();
  }, []);

  // En la pantalla preconsulta: después de un tiempo la transcripción se desvanece para dar paso a la siguiente
  const FADE_AFTER_MS = 10000;
  useEffect(() => {
    if (state.screen !== 'patient-assistant-intro' || !assistantTranscription) return;
    const t = setTimeout(() => setAssistantTranscription(null), FADE_AFTER_MS);
    return () => clearTimeout(t);
  }, [state.screen, assistantTranscription]);

  // Enviar contexto de pantalla al asistente cuando cambie el estado (solo flujo paciente)
  useEffect(() => {
    if (state.screen === 'login' || state.screen === 'doctor-dashboard') return;
    const ctx = getContextFromState(state);
    // En la pantalla del círculo morado (cuestionario preconsulta) reiniciamos el contexto
    // para que el asistente solo haga la entrevista del cuestionario, no guía de otras pantallas
    if (state.screen === 'patient-assistant-intro') {
      sendPreconsultContextReset(ctx);
    } else {
      updateAssistantContext(ctx);
    }
  }, [state]);

  const handlePatientLogin = (patient: Patient) => {
    setState({ screen: 'patient-dashboard', patient });
  };

  const handleDoctorLogin = (doctor: Doctor) => {
    setState({ screen: 'doctor-dashboard', doctor });
  };

  const handleLogout = () => {
    setState({ screen: 'login' });
  };

  const handleNewRecord = (patient: Patient) => {
    setState({ screen: 'patient-welcome', patient });
  };

  const handleRegisterPain = (patient: Patient) => {
    // Flujo "Registra tu dolor antes de la consulta" (botón verde): al finalizar → cuestionario preconsulta
    const savedCustomPoints = loadCustomPointsFromStorage();
    const savedLocations = loadRegisteredLocationsFromStorage();
    setState({
      screen: 'patient-pain-location',
      patient,
      registeredLocations: savedLocations,
      customPoints: savedCustomPoints,
      isPreConsultFlow: true,
    });
  };

  const handleStart = (patient: Patient) => {
    // Flujo registro diario (Welcome → "Registrar cómo me siento"): al finalizar → dashboard, sin preconsulta
    const savedCustomPoints = loadCustomPointsFromStorage();
    const savedLocations = loadRegisteredLocationsFromStorage();
    setState({
      screen: 'patient-pain-location',
      patient,
      registeredLocations: savedLocations,
      customPoints: savedCustomPoints,
      isNewRecord: true,
      remainingTreatedParts: patient.treatedBodyParts ? [...patient.treatedBodyParts] : undefined,
      isPreConsultFlow: false,
    });
  };

  const handleLocationSelect = (patient: Patient, location: PainLocation, registeredLocations: PainLocation[] = [], customPoints: CustomPoint[] = [], updatedCustomPoints?: CustomPoint[], isNewRecord?: boolean, remainingTreatedParts?: PainLocation[], isPreConsultFlow?: boolean) => {
    const pointsToUse = updatedCustomPoints || customPoints;
    saveCustomPointsToStorage(pointsToUse);
    saveRegisteredLocationsToStorage(registeredLocations);
    setState({ screen: 'patient-pain-level', patient, location, registeredLocations, customPoints: pointsToUse, isNewRecord, remainingTreatedParts, isPreConsultFlow });
  };

  const handleLevelSelect = (patient: Patient, location: PainLocation, painLevel: PainLevel, registeredLocations: PainLocation[] = [], customPoints: CustomPoint[] = [], isNewRecord?: boolean, remainingTreatedParts?: PainLocation[], isPreConsultFlow?: boolean) => {
    saveCustomPointsToStorage(customPoints);
    saveRegisteredLocationsToStorage(registeredLocations);
    setState({ screen: 'patient-pain-type', patient, location, painLevel, registeredLocations, customPoints, isNewRecord, remainingTreatedParts, isPreConsultFlow });
  };

  const handleTypeSelect = (
    patient: Patient,
    location: PainLocation,
    painLevel: PainLevel,
    types: PainType[],
    registeredLocations: PainLocation[] = [],
    customPoints: CustomPoint[] = [],
    otherText?: string,
    isNewRecord?: boolean,
    remainingTreatedParts?: PainLocation[],
    isPreConsultFlow?: boolean
  ) => {
    // Guardar el registro inmediatamente
    addPainRecord({
      patientDNI: patient.dni,
      date: new Date(),
      painLevel,
      location,
      type: types[0] || 'Molesto', // Usar el primer tipo o un valor por defecto
    });
    
    // Agregar la ubicación a la lista de registradas
    const updatedLocations = [...registeredLocations, location];
    
    // Si es "Otro", marcar todos los puntos pendientes como confirmados
    let updatedCustomPoints = customPoints;
    if (location === 'Otro') {
      updatedCustomPoints = customPoints.map(p => ({ ...p, confirmed: true }));
    }
    
    // Si es nuevo registro y hay partes tratadas, eliminar la parte registrada de la lista
    let updatedRemainingTreatedParts = remainingTreatedParts;
    if (isNewRecord && remainingTreatedParts && remainingTreatedParts.length > 0) {
      updatedRemainingTreatedParts = remainingTreatedParts.filter(part => part !== location);
    }
    
    // Guardar en localStorage
    saveCustomPointsToStorage(updatedCustomPoints);
    saveRegisteredLocationsToStorage(updatedLocations);
    
    setState({
      screen: 'patient-registration-summary',
      patient,
      location,
      painLevel,
      types,
      remainingTreatedParts: updatedRemainingTreatedParts,
      isPreConsultFlow,
    });
  };

  const handleSaveRecord = (
    patient: Patient,
    location: PainLocation,
    painLevel: PainLevel,
    types: PainType[],
    registeredLocations: PainLocation[] = [],
    customPoints: CustomPoint[] = [],
    comment?: string
  ) => {
    // El nuevo tipo PainRecord usa 'type' (singular), tomar el primer tipo
    addPainRecord({
      patientDNI: patient.dni,
      date: new Date(),
      painLevel,
      location,
      type: types[0] || 'Molesto', // Usar el primer tipo o un valor por defecto
    });
    // Agregar la ubicación a la lista de registradas
    const updatedLocations = [...registeredLocations, location];
    // Si es "Otro", marcar todos los puntos pendientes como confirmados
    let updatedCustomPoints = customPoints;
    if (location === 'Otro') {
      updatedCustomPoints = customPoints.map(p => ({ ...p, confirmed: true }));
    }
    // Guardar en localStorage
    saveCustomPointsToStorage(updatedCustomPoints);
    saveRegisteredLocationsToStorage(updatedLocations);
    // Volver al BodyMap con los puntos actualizados
    setState({ screen: 'patient-pain-location', patient, registeredLocations: updatedLocations, customPoints: updatedCustomPoints });
  };

  const handleFinishRegistration = (patient: Patient) => {
    // Limpiar localStorage cuando se finaliza el registro
    clearPainRegistrationStorage();
    setState({ screen: 'patient-dashboard', patient });
  };

  if (state.screen === 'login') {
    return <Login onPatientLogin={handlePatientLogin} onDoctorLogin={handleDoctorLogin} />;
  }

  if (state.screen === 'patient-dashboard') {
    const activeMedicationIds = (state.patient.medications ?? []).filter((m) => m.active).map((m) => m.id);
    const hasMedicationToday = hasRegisteredMedicationToday(state.patient.dni, activeMedicationIds);
    return (
      <PatientDashboard
        patient={state.patient}
        hasRegisteredMedicationToday={hasMedicationToday}
        hasRequestedUrgentAppointment={getUrgentRequestSentFromStorage(state.patient.dni)}
        onUrgentRequestSent={() => {
          setUrgentRequestSentToStorage(state.patient.dni);
          setState((prev) =>
            prev.screen === 'patient-dashboard'
              ? { ...prev, urgentRequestVersion: ((prev as { urgentRequestVersion?: number }).urgentRequestVersion ?? 0) + 1 }
              : prev
          );
        }}
        onMedicationRecord={(record) => {
          saveMedicationRecordToStorage(state.patient.dni, record);
          setState((prev) =>
            prev.screen === 'patient-dashboard'
              ? { ...prev, medicationRecordsVersion: ((prev as { medicationRecordsVersion?: number }).medicationRecordsVersion ?? 0) + 1 }
              : prev
          );
        }}
        onNewRecord={() => handleNewRecord(state.patient)}
        onRegisterPain={() => handleRegisterPain(state.patient)}
        onLogout={handleLogout}
        onViewProfile={() => setState({ screen: 'patient-profile', patient: state.patient })}
        assistantStatus={assistantStatus}
        assistantError={assistantError}
        disconnectAssistant={disconnectAssistant}
        onConnectAssistant={handleConnectAssistant}
      />
    );
  }

  if (state.screen === 'patient-welcome') {
    return (
      <>
        <Welcome onStart={() => handleStart(state.patient)} patientName={state.patient.name} />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'patient-pain-location') {
    // Mostrar "Partes en tratamiento" cuando hay partes pendientes (p. ej. al registrar un segundo dolor desde el resumen)
    const hasRemainingParts = state.remainingTreatedParts && state.remainingTreatedParts.length > 0;
    const treatedBodyPartsToShow = hasRemainingParts ? state.remainingTreatedParts : undefined;
    return (
      <>
      <PainLocationSelector
        gender={state.patient.gender === 'Hombre' ? 'hombre' : state.patient.gender === 'Mujer' ? 'mujer' : 'hombre'}
        registeredLocations={state.registeredLocations || []}
        customPoints={state.customPoints || []}
        treatedBodyParts={treatedBodyPartsToShow}
        onSelect={(location, updatedCustomPoints) => handleLocationSelect(state.patient, location, state.registeredLocations ?? [], state.customPoints ?? [], updatedCustomPoints, state.isNewRecord, state.remainingTreatedParts, state.isPreConsultFlow)}
        onCustomPointsChange={(points) => {
          // Guardar en localStorage cuando cambien los puntos
          saveCustomPointsToStorage(points);
          setState({ ...state, customPoints: points });
        }}
        onBack={() => {
          // Limpiar localStorage al cancelar
          clearPainRegistrationStorage();
          setState({ screen: 'patient-dashboard', patient: state.patient });
        }}
        onFinish={() => handleFinishRegistration(state.patient)}
      />
      <VoiceAssistantFab
        assistantStatus={assistantStatus}
        assistantError={assistantError}
        disconnectAssistant={disconnectAssistant}
        onConnectAssistant={handleConnectAssistant}
      />
      </>
    );
  }

  if (state.screen === 'patient-pain-level') {
    return (
      <>
        <PainLevelSelector
          onSelect={(level) => handleLevelSelect(state.patient, state.location, level, state.registeredLocations ?? [], state.customPoints ?? [], state.isNewRecord, state.remainingTreatedParts, state.isPreConsultFlow)}
          onBack={() => {
            saveCustomPointsToStorage(state.customPoints || []);
            saveRegisteredLocationsToStorage(state.registeredLocations || []);
            setState({ screen: 'patient-pain-location', patient: state.patient, registeredLocations: state.registeredLocations, customPoints: state.customPoints, isNewRecord: state.isNewRecord, remainingTreatedParts: state.remainingTreatedParts });
          }}
        />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'patient-pain-type') {
    return (
      <>
        <PainTypeSelector
          onSelect={(types, comment) => handleTypeSelect(state.patient, state.location, state.painLevel, types, state.registeredLocations ?? [], state.customPoints ?? [], comment, state.isNewRecord, state.remainingTreatedParts, state.isPreConsultFlow)}
          onBack={() => {
            saveCustomPointsToStorage(state.customPoints || []);
            saveRegisteredLocationsToStorage(state.registeredLocations || []);
            setState({ screen: 'patient-pain-level', patient: state.patient, location: state.location, registeredLocations: state.registeredLocations, customPoints: state.customPoints, isNewRecord: state.isNewRecord, remainingTreatedParts: state.remainingTreatedParts });
          }}
        />
<VoiceAssistantFab
        assistantStatus={assistantStatus}
        assistantError={assistantError}
        disconnectAssistant={disconnectAssistant}
        onConnectAssistant={handleConnectAssistant}
      />
      </>
    );
  }

  if (state.screen === 'patient-registration-summary') {
    // Cargar datos guardados desde localStorage
    const savedCustomPoints = loadCustomPointsFromStorage();
    const savedLocations = loadRegisteredLocationsFromStorage();
    const hasMoreParts = state.remainingTreatedParts && state.remainingTreatedParts.length > 0;
    
    return (
      <>
        <RegistrationSummary
          location={state.location}
          painLevel={state.painLevel}
          types={state.types}
          hasMoreParts={hasMoreParts || false}
          onContinue={() => {
            setState({
              screen: 'patient-pain-location',
              patient: state.patient,
              registeredLocations: savedLocations,
              customPoints: savedCustomPoints,
              isNewRecord: true,
              remainingTreatedParts: state.remainingTreatedParts ?? [],
              isPreConsultFlow: state.isPreConsultFlow,
            });
          }}
          onFinish={() => {
            if (state.isPreConsultFlow) {
              setAssistantTranscription(null);
              transcriptionPendingRef.current = '';
              setState({ screen: 'patient-assistant-intro', patient: state.patient });
            } else {
              handleFinishRegistration(state.patient);
            }
          }}
        />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'patient-assistant-intro') {
    return (
      <AssistantIntro
        transcription={assistantTranscription}
        onContinue={() => {
          clearPainRegistrationStorage();
          setAssistantTranscription(null);
          transcriptionPendingRef.current = '';
          setState({ screen: 'patient-dashboard', patient: state.patient });
        }}
        assistantStatus={assistantStatus}
        assistantError={assistantError}
        disconnectAssistant={disconnectAssistant}
        onConnectAssistant={handleConnectAssistant}
      />
    );
  }

  if (state.screen === 'patient-thank-you') {
    return (
      <>
        <ThankYou
          onContinue={() => {}}
          onFinish={() => handleFinishRegistration(state.patient)}
          hasMoreParts={false}
        />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'patient-confirmation') {
    return (
      <>
        <Confirmation
          painLevel={state.painLevel}
          location={state.location}
          types={state.types}
          comment={state.comment}
          onSave={() => handleSaveRecord(state.patient, state.location, state.painLevel, state.types, state.registeredLocations || [], state.customPoints || [], state.comment)}
          onExit={() => {
            clearPainRegistrationStorage();
            setState({ screen: 'patient-dashboard', patient: state.patient });
          }}
        />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'patient-profile') {
    if (!state.patient) {
      return <Login onPatientLogin={handlePatientLogin} onDoctorLogin={handleDoctorLogin} />;
    }
    return (
      <>
        <PatientProfile
          patient={state.patient}
          onBack={() => setState({ screen: 'patient-dashboard', patient: state.patient })}
          onPatientUpdate={(updated) => {
            updatePatient(updated);
            setState((s) => ({ ...s, patient: updated }));
          }}
        />
        <VoiceAssistantFab
          assistantStatus={assistantStatus}
          assistantError={assistantError}
          disconnectAssistant={disconnectAssistant}
          onConnectAssistant={handleConnectAssistant}
        />
      </>
    );
  }

  if (state.screen === 'doctor-dashboard') {
    return <DoctorDashboard doctor={state.doctor} onLogout={handleLogout} />;
  }

  return null;
}