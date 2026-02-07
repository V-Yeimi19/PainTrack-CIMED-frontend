import { useState, useEffect } from 'react';
import { Login } from '@/app/components/Login';
import { Welcome } from '@/app/components/patient/Welcome';
import { PainLevelSelector } from '@/app/components/patient/PainLevelSelector';
import { PainLocationSelector } from '@/app/components/patient/PainLocationSelector';
import { PainTypeSelector } from '@/app/components/patient/PainTypeSelector';
import { Confirmation } from '@/app/components/patient/Confirmation';
import { PatientDashboard } from '@/app/components/patient/PatientDashboard';
import { PatientProfile } from '@/app/components/patient/PatientProfile';
import { DoctorDashboard } from '@/app/components/doctor/DoctorDashboard';
import { Patient, Doctor, PainLevel, PainLocation, PainType } from '@/app/types';
import { addPainRecord } from '@/app/data/mockData';
import { CustomPoint } from '@/app/components/patient/BodyMap';

// Claves para localStorage
const STORAGE_KEY_CUSTOM_POINTS = 'painTrack_customPoints';
const STORAGE_KEY_REGISTERED_LOCATIONS = 'painTrack_registeredLocations';

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

type AppState = 
  | { screen: 'login' }
  | { screen: 'patient-dashboard'; patient: Patient }
  | { screen: 'patient-profile'; patient: Patient }
  | { screen: 'patient-welcome'; patient: Patient }
  | { screen: 'patient-pain-location'; patient: Patient; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[] }
  | { screen: 'patient-pain-level'; patient: Patient; location: PainLocation; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[] }
  | { screen: 'patient-pain-type'; patient: Patient; location: PainLocation; painLevel: PainLevel; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[] }
  | { screen: 'patient-confirmation'; patient: Patient; painLevel: PainLevel; location: PainLocation; types: PainType[]; comment?: string; registeredLocations?: PainLocation[]; customPoints?: CustomPoint[] }
  | { screen: 'doctor-dashboard'; doctor: Doctor };

export default function App() {
  const [state, setState] = useState<AppState>({ screen: 'login' });

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

  const handleStart = (patient: Patient) => {
    // Cargar puntos y ubicaciones desde localStorage
    const savedCustomPoints = loadCustomPointsFromStorage();
    const savedLocations = loadRegisteredLocationsFromStorage();
    setState({ 
      screen: 'patient-pain-location', 
      patient, 
      registeredLocations: savedLocations, 
      customPoints: savedCustomPoints 
    });
  };

  const handleLocationSelect = (patient: Patient, location: PainLocation, registeredLocations: PainLocation[] = [], customPoints: CustomPoint[] = [], updatedCustomPoints?: CustomPoint[]) => {
    // Usar los puntos actualizados si se proporcionan, sino usar los del estado
    const pointsToUse = updatedCustomPoints || customPoints;
    // Guardar en localStorage
    saveCustomPointsToStorage(pointsToUse);
    saveRegisteredLocationsToStorage(registeredLocations);
    setState({ screen: 'patient-pain-level', patient, location, registeredLocations, customPoints: pointsToUse });
  };

  const handleLevelSelect = (patient: Patient, location: PainLocation, painLevel: PainLevel, registeredLocations: PainLocation[] = [], customPoints: CustomPoint[] = []) => {
    // Guardar en localStorage
    saveCustomPointsToStorage(customPoints);
    saveRegisteredLocationsToStorage(registeredLocations);
    setState({ screen: 'patient-pain-type', patient, location, painLevel, registeredLocations, customPoints });
  };

  const handleTypeSelect = (
    patient: Patient,
    location: PainLocation,
    painLevel: PainLevel,
    types: PainType[],
    registeredLocations: PainLocation[] = [],
    customPoints: CustomPoint[] = [],
    comment?: string
  ) => {
    // Guardar en localStorage
    saveCustomPointsToStorage(customPoints);
    saveRegisteredLocationsToStorage(registeredLocations);
    setState({ screen: 'patient-confirmation', patient, location, painLevel, types, comment, registeredLocations, customPoints });
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
    return (
      <PatientDashboard
        patient={state.patient}
        onNewRecord={() => handleNewRecord(state.patient)}
        onLogout={handleLogout}
        onViewProfile={() => setState({ screen: 'patient-profile', patient: state.patient })}
      />
    );
  }

  if (state.screen === 'patient-welcome') {
    return <Welcome onStart={() => handleStart(state.patient)} patientName={state.patient.name} />;
  }

  if (state.screen === 'patient-pain-location') {
    return (
      <PainLocationSelector
        gender={state.patient.gender === 'Hombre' ? 'hombre' : state.patient.gender === 'Mujer' ? 'mujer' : 'hombre'}
        registeredLocations={state.registeredLocations || []}
        customPoints={state.customPoints || []}
        onSelect={(location, updatedCustomPoints) => handleLocationSelect(state.patient, location, state.registeredLocations, state.customPoints, updatedCustomPoints)}
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
    );
  }

  if (state.screen === 'patient-pain-level') {
    return (
      <PainLevelSelector
        onSelect={(level) => handleLevelSelect(state.patient, state.location, level, state.registeredLocations, state.customPoints)}
        onBack={() => {
          // Guardar al volver
          saveCustomPointsToStorage(state.customPoints || []);
          saveRegisteredLocationsToStorage(state.registeredLocations || []);
          setState({ screen: 'patient-pain-location', patient: state.patient, registeredLocations: state.registeredLocations, customPoints: state.customPoints });
        }}
      />
    );
  }

  if (state.screen === 'patient-pain-type') {
    return (
      <PainTypeSelector
        onSelect={(types, comment) => handleTypeSelect(state.patient, state.location, state.painLevel, types, state.registeredLocations, state.customPoints, comment)}
        onBack={() => {
          // Guardar al volver
          saveCustomPointsToStorage(state.customPoints || []);
          saveRegisteredLocationsToStorage(state.registeredLocations || []);
          setState({ screen: 'patient-pain-level', patient: state.patient, location: state.location, registeredLocations: state.registeredLocations, customPoints: state.customPoints });
        }}
      />
    );
  }

  if (state.screen === 'patient-confirmation') {
    return (
      <Confirmation
        painLevel={state.painLevel}
        location={state.location}
        types={state.types}
        comment={state.comment}
        onSave={() => handleSaveRecord(state.patient, state.location, state.painLevel, state.types, state.registeredLocations || [], state.customPoints || [], state.comment)}
        onExit={() => {
          // Limpiar localStorage al salir sin guardar
          clearPainRegistrationStorage();
          setState({ screen: 'patient-dashboard', patient: state.patient });
        }}
      />
    );
  }

  if (state.screen === 'patient-profile') {
    if (!state.patient) {
      return <Login onPatientLogin={handlePatientLogin} onDoctorLogin={handleDoctorLogin} />;
    }
    return (
      <PatientProfile
        patient={state.patient}
        onBack={() => setState({ screen: 'patient-dashboard', patient: state.patient })}
      />
    );
  }

  if (state.screen === 'doctor-dashboard') {
    return <DoctorDashboard doctor={state.doctor} onLogout={handleLogout} />;
  }

  return null;
}