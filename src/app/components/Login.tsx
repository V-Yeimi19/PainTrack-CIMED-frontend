import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { findPatientByDNI, findDoctorByCode } from '@/app/data/mockData';
import { Patient, Doctor } from '@/app/types';
import { User, Stethoscope, Activity } from 'lucide-react';

interface LoginProps {
  onPatientLogin: (patient: Patient) => void;
  onDoctorLogin: (doctor: Doctor) => void;
}

type Role = 'patient' | 'doctor' | null;

export function Login({ onPatientLogin, onDoctorLogin }: LoginProps) {
  const [role, setRole] = useState<Role>(null);
  const [dni, setDni] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePatientLogin = () => {
    const patient = findPatientByDNI(dni);
    if (patient) {
      onPatientLogin(patient);
    } else {
      setError('DNI no encontrado. Prueba con: 12345678');
    }
  };

  const handleDoctorLogin = () => {
    const doctor = findDoctorByCode(doctorCode);
    if (doctor && doctor.password === password) {
      onDoctorLogin(doctor);
    } else {
      setError('Código o contraseña incorrectos. Prueba con: MED001 / 1234');
    }
  };

  if (role === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-teal-50 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          {/* Logo y Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-6 rounded-3xl shadow-2xl">
                <Activity className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-blue-900 mb-4">
              PainTrack CIMED
            </h1>
            <p className="text-2xl text-gray-600 font-medium">
              Gestionemos tu dolor
            </p>
          </div>

          {/* Botones de selección */}
          <div className="space-y-4 max-w-md mx-auto w-full">
            <Button
              onClick={() => setRole('patient')}
              className="w-full h-28 text-3xl font-bold bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-4 shadow-xl"
              size="lg"
            >
              <User className="w-10 h-10" strokeWidth={2.5} />
              👤 Soy Paciente
            </Button>
            <Button
              onClick={() => setRole('doctor')}
              className="w-full h-28 text-3xl font-bold bg-green-600 hover:bg-green-700 flex items-center justify-center gap-4 shadow-xl"
              size="lg"
            >
              <Stethoscope className="w-10 h-10" strokeWidth={2.5} />
              🩺 Soy Médico
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (role === 'patient') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-5 rounded-3xl shadow-xl">
                <User className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-3">
              Acceso Paciente
            </h1>
            <p className="text-xl text-gray-600">Ingresa tu DNI</p>
          </div>

          {/* Formulario */}
          <div className="space-y-8 max-w-md mx-auto w-full">
            <div>
              <Input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="DNI"
                value={dni}
                onChange={(e) => {
                  setDni(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                className="h-24 text-4xl text-center font-bold shadow-lg"
                maxLength={8}
              />
            </div>
            
            {error && (
              <p className="text-red-600 text-lg text-center font-semibold bg-red-50 p-4 rounded-xl">{error}</p>
            )}
            
            <div className="space-y-4">
              <Button
                onClick={handlePatientLogin}
                className="w-full h-24 text-3xl font-bold bg-blue-600 hover:bg-blue-700 shadow-xl"
                disabled={dni.length < 7}
              >
                CONTINUAR
              </Button>
              <Button
                onClick={() => {
                  setRole(null);
                  setDni('');
                  setError('');
                }}
                variant="outline"
                className="w-full h-20 text-2xl font-bold"
              >
                ATRÁS
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-green-600 p-5 rounded-3xl shadow-xl">
              <Stethoscope className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-3">
            Acceso Médico
          </h1>
          <p className="text-xl text-gray-600">Ingresa tus credenciales</p>
        </div>

        {/* Formulario */}
        <div className="space-y-6 max-w-md mx-auto w-full">
          <div>
            <label className="text-xl font-semibold text-gray-700 mb-3 block">
              Correo electrónico
            </label>
            <Input
              type="text"
              placeholder="Código de médico"
              value={doctorCode}
              onChange={(e) => {
                setDoctorCode(e.target.value.toUpperCase());
                setError('');
              }}
              className="h-20 text-3xl text-center font-bold shadow-lg"
            />
          </div>
          
          <div>
            <label className="text-xl font-semibold text-gray-700 mb-3 block">
              Contraseña
            </label>
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="h-20 text-3xl text-center shadow-lg"
            />
          </div>
          
          {error && (
            <p className="text-red-600 text-lg text-center font-semibold bg-red-50 p-4 rounded-xl">{error}</p>
          )}
          
          <div className="space-y-4">
            <Button
              onClick={handleDoctorLogin}
              className="w-full h-24 text-3xl font-bold bg-green-600 hover:bg-green-700 shadow-xl"
              disabled={!doctorCode || !password}
            >
              INICIAR SESIÓN
            </Button>
            <Button
              onClick={() => {
                setRole(null);
                setDoctorCode('');
                setPassword('');
                setError('');
              }}
              variant="outline"
              className="w-full h-20 text-2xl font-bold"
            >
              ATRÁS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
