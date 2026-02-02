import { useState } from 'react';
import { Login } from '@/app/components/Login';
import { Welcome } from '@/app/components/patient/Welcome';
import { PainLevelSelector } from '@/app/components/patient/PainLevelSelector';
import { PainLocationSelector } from '@/app/components/patient/PainLocationSelector';
import { PainTypeSelector } from '@/app/components/patient/PainTypeSelector';
import { Confirmation } from '@/app/components/patient/Confirmation';
import { PatientDashboard } from '@/app/components/patient/PatientDashboard';
import { DoctorDashboard } from '@/app/components/doctor/DoctorDashboard';
import { Patient, Doctor, PainLevel, PainLocation, PainType } from '@/app/types';
import { addPainRecord } from '@/app/data/mockData';

type AppState = 
  | { screen: 'login' }
  | { screen: 'patient-dashboard'; patient: Patient }
  | { screen: 'patient-welcome'; patient: Patient }
  | { screen: 'patient-pain-location'; patient: Patient }
  | { screen: 'patient-pain-level'; patient: Patient; location: PainLocation }
  | { screen: 'patient-pain-type'; patient: Patient; location: PainLocation; painLevel: PainLevel }
  | { screen: 'patient-confirmation'; patient: Patient; painLevel: PainLevel; location: PainLocation; type: PainType }
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
    setState({ screen: 'patient-pain-location', patient });
  };

  const handleLocationSelect = (patient: Patient, location: PainLocation) => {
    setState({ screen: 'patient-pain-level', patient, location });
  };

  const handleLevelSelect = (patient: Patient, location: PainLocation, painLevel: PainLevel) => {
    setState({ screen: 'patient-pain-type', patient, location, painLevel });
  };

  const handleTypeSelect = (
    patient: Patient,
    location: PainLocation,
    painLevel: PainLevel,
    type: PainType
  ) => {
    setState({ screen: 'patient-confirmation', patient, location, painLevel, type });
  };

  const handleSaveRecord = (
    patient: Patient,
    location: PainLocation,
    painLevel: PainLevel,
    type: PainType
  ) => {
    addPainRecord({
      patientDNI: patient.dni,
      date: new Date(),
      painLevel,
      location,
      type,
    });
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
      />
    );
  }

  if (state.screen === 'patient-welcome') {
    return <Welcome onStart={() => handleStart(state.patient)} patientName={state.patient.name} />;
  }

  if (state.screen === 'patient-pain-location') {
    return (
      <PainLocationSelector
        onSelect={(location) => handleLocationSelect(state.patient, location)}
        onBack={() => setState({ screen: 'patient-dashboard', patient: state.patient })}
      />
    );
  }

  if (state.screen === 'patient-pain-level') {
    return (
      <PainLevelSelector
        onSelect={(level) => handleLevelSelect(state.patient, state.location, level)}
        onBack={() => setState({ screen: 'patient-pain-location', patient: state.patient })}
      />
    );
  }

  if (state.screen === 'patient-pain-type') {
    return (
      <PainTypeSelector
        onSelect={(type) => handleTypeSelect(state.patient, state.location, state.painLevel, type)}
        onBack={() => setState({ screen: 'patient-pain-level', patient: state.patient, location: state.location })}
      />
    );
  }

  if (state.screen === 'patient-confirmation') {
    return (
      <Confirmation
        painLevel={state.painLevel}
        location={state.location}
        type={state.type}
        onSave={() => handleSaveRecord(state.patient, state.painLevel, state.location, state.type)}
        onExit={() => setState({ screen: 'patient-dashboard', patient: state.patient })}
      />
    );
  }

  if (state.screen === 'doctor-dashboard') {
    return <DoctorDashboard doctor={state.doctor} onLogout={handleLogout} />;
  }

  return null;
}