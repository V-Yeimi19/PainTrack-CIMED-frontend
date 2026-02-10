import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { findPatientByDNI, findDoctorByCode } from '@/app/data/mockData';
import { Patient, Doctor } from '@/app/types';
import { User, Stethoscope, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onPatientLogin: (patient: Patient) => void;
  onDoctorLogin: (doctor: Doctor) => void;
}

type Role = 'patient' | 'doctor' | null;

export function Login({ onPatientLogin, onDoctorLogin }: LoginProps) {
  const [role, setRole] = useState<Role>(null);
  const [dni, setDni] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [doctorCode, setDoctorCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPatientPassword, setShowPatientPassword] = useState(false);

  const handlePatientLogin = () => {
    const patient = findPatientByDNI(dni);
    if (patient && patient.dni === dni) {
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

  // Pantalla inicial de selección de rol
  if (role === null) {
    return (
      <div className="min-h-screen flex">
        {/* Panel izquierdo - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-[hsl(270,81%,95%)] p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 lg:w-56 lg:h-56 bg-white/50 rounded-full blur-3xl"></div>
              </div>
              <img 
                src="/images/logo-cimed.png" 
                alt="CIMED Logo" 
                className="h-32 lg:h-40 w-auto object-contain brightness-125 drop-shadow-[0_0_30px_rgba(255,255,255,1),0_0_60px_rgba(255,255,255,0.8),0_0_90px_rgba(255,255,255,0.5)] filter relative z-10"
              />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 text-center [text-shadow:_-2px_-2px_0_hsl(270_70%_60%),_2px_-2px_0_hsl(270_70%_60%),_-2px_2px_0_hsl(270_70%_60%),_2px_2px_0_hsl(270_70%_60%)]">
              Iniciar Sesión
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Bienvenido a PainTrack CIMED
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => setRole('patient')}
                className="w-full h-20 text-xl font-semibold flex items-center justify-center text-white bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:to-[hsl(270,70%,40%)] transition-all rounded-xl border-0 shadow-[0_0_20px_rgba(147,51,234,0.6),0_4px_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8),0_6px_20px_rgba(147,51,234,0.6)]"
              >
                Soy Paciente
              </Button>
              <Button
                onClick={() => setRole('doctor')}
                className="w-full h-20 text-xl font-semibold flex items-center justify-center text-white bg-gradient-to-r from-[hsl(270,70%,50%)]/60 to-[hsl(270,70%,45%)]/60 hover:from-[hsl(270,70%,45%)]/70 hover:to-[hsl(270,70%,40%)]/70 transition-all rounded-xl border-0 border-[hsl(270,70%,50%)]/40"
              >
                Soy Médico
              </Button>
            </div>
          </div>
        </div>

        {/* Panel derecho - Imagen de fondo */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-purple-900">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/medico.jpg)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-white/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(210,11%,16%)]/90 via-[hsl(270,81%,28%)]/75 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
            <h2 className="text-4xl font-bold text-white mb-4 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              PainTrack CIMED
            </h2>
            <p className="text-xl text-white text-center max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Sistema de Seguimiento y Gestión del Dolor
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de Paciente
  if (role === 'patient') {
    return (
      <div className="min-h-screen flex">
        {/* Panel izquierdo - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-[hsl(270,81%,95%)] p-8 lg:p-12">
          <div className="w-full max-w-md">
            <Button
              onClick={() => {
                setRole(null);
                setDni('');
                setPatientPassword('');
                setError('');
              }}
              className="mb-8 p-4 text-lg font-semibold text-white bg-gradient-to-r from-[hsl(270,70%,70%)] to-[hsl(270,70%,65%)] hover:from-[hsl(270,70%,65%)] hover:to-[hsl(270,70%,60%)] rounded-lg transition-all min-h-[56px]"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
              Volver
            </Button>

            <div className="mb-6 flex justify-center">
              <img 
                src="/images/logo-cimed.png" 
                alt="CIMED Logo" 
                className="h-32 lg:h-40 w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter"
              />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 text-center [text-shadow:_-2px_-2px_0_hsl(270_70%_50%),_2px_-2px_0_hsl(270_70%_50%),_-2px_2px_0_hsl(270_70%_50%),_2px_2px_0_hsl(270_70%_50%)]">
              Acceso Paciente
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Ingresa tu DNI para continuar
            </p>

            <div className="space-y-6">
              <div>
                <Label htmlFor="dni" className="text-base font-semibold text-gray-700 mb-2 block">
                  DNI
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[hsl(270,81%,56%)] z-10" />
                  <Input
                    id="dni"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value.replace(/\D/g, '').slice(0, 8));
                      setError('');
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && dni.length >= 7) {
                        handlePatientLogin();
                      }
                    }}
                    className="h-14 pl-12 text-lg bg-[hsl(270,81%,96%)] border-[hsl(270,81%,85%)] focus:border-[hsl(270,81%,56%)] focus:ring-[hsl(270,81%,56%)]"
                    maxLength={8}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePatientLogin}
                className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:to-[hsl(270,70%,40%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border-0 shadow-[0_0_20px_rgba(147,51,234,0.6),0_4px_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8),0_6px_20px_rgba(147,51,234,0.6)] disabled:shadow-none"
                disabled={dni.length < 7}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>

        {/* Panel derecho - Imagen de fondo */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-purple-900">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/images/paciente.png)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-white/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(270,81%,28%)]/90 via-[hsl(270,81%,28%)]/75 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
            <h2 className="text-4xl font-bold text-white mb-4 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              PainTrack CIMED
            </h2>
            <p className="text-xl text-white text-center max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Sistema de Seguimiento y Gestión del Dolor
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de Médico
  return (
    <div className="min-h-screen flex">
        {/* Panel izquierdo - Formulario */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-[hsl(270,81%,95%)] p-8 lg:p-12">
          <div className="w-full max-w-md">
            <Button
              onClick={() => {
                setRole(null);
                setDoctorCode('');
                setPassword('');
                setError('');
              }}
              className="mb-8 p-4 text-lg font-semibold text-white bg-gradient-to-r from-[hsl(270,70%,70%)] to-[hsl(270,70%,65%)] hover:from-[hsl(270,70%,65%)] hover:to-[hsl(270,70%,60%)] rounded-lg transition-all min-h-[56px]"
            >
              <ArrowLeft className="w-6 h-6 mr-3" />
              Volver
            </Button>

            <div className="mb-6 flex justify-center">
              <img 
                src="/images/logo-cimed.png" 
                alt="CIMED Logo" 
                className="h-32 lg:h-40 w-auto object-contain brightness-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter"
              />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 text-center [text-shadow:_-2px_-2px_0_hsl(270_70%_50%),_2px_-2px_0_hsl(270_70%_50%),_-2px_2px_0_hsl(270_70%_50%),_2px_2px_0_hsl(270_70%_50%)]">
              Acceso Médico
            </h1>
            <p className="text-lg text-gray-600 mb-8 text-center">
              Ingresa tus credenciales para continuar
            </p>

          <div className="space-y-6">
            <div>
              <Label htmlFor="doctorCode" className="text-base font-semibold text-gray-700 mb-2 block">
                Código médico
              </Label>
              <div className="relative">
                <Stethoscope className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[hsl(270,81%,56%)] z-10" />
                <Input
                  id="doctorCode"
                  type="text"
                  placeholder="MED001"
                  value={doctorCode}
                  onChange={(e) => {
                    setDoctorCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="h-14 pl-12 text-lg bg-[hsl(270,81%,96%)] border-[hsl(270,81%,85%)] focus:border-[hsl(270,81%,56%)] focus:ring-[hsl(270,81%,56%)]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-semibold text-gray-700 mb-2 block">
                Contraseña
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[hsl(270,81%,56%)] z-10">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="h-14 pl-12 pr-12 text-lg bg-[hsl(270,81%,96%)] border-[hsl(270,81%,85%)] focus:border-[hsl(270,81%,56%)] focus:ring-[hsl(270,81%,56%)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(270,81%,56%)] hover:text-[hsl(270,81%,40%)] z-10"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              onClick={handleDoctorLogin}
              className="w-full h-14 text-lg font-semibold text-white bg-gradient-to-r from-[hsl(270,70%,45%)] to-[hsl(270,70%,40%)] hover:from-[hsl(270,70%,40%)] hover:to-[hsl(270,70%,35%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl border-0 shadow-[0_0_20px_rgba(147,51,234,0.6),0_4px_15px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.8),0_6px_20px_rgba(147,51,234,0.6)] disabled:shadow-none min-h-[56px]"
              disabled={!doctorCode || !password}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Panel derecho - Imagen de fondo con logo */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-purple-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/medico.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 via-white/20 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(210,11%,16%)]/90 via-[hsl(270,81%,28%)]/75 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center justify-center p-12 w-full">
          <div className="mb-6">
           
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            PainTrack CIMED
          </h2>
          <p className="text-xl text-white text-center max-w-md drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            Sistema de Seguimiento y Gestión del Dolor
          </p>
        </div>
      </div>
    </div>
  );
}
