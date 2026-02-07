import { Button } from '@/app/components/ui/button';
import { Activity } from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
  patientName?: string;
}

export function Welcome({ onStart, patientName }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        {/* Header con icono */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-600 p-6 rounded-3xl shadow-2xl">
              <Activity className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-purple-900 mb-6 leading-tight">
            {patientName ? `Hola, ${patientName}` : 'Hola'}
          </h1>
          
          <p className="text-3xl text-purple-700 font-semibold mb-6 leading-tight">
            Vamos a registrar cómo te sientes hoy
          </p>
        </div>

        {/* Botón principal */}
        <div className="max-w-md mx-auto w-full">
          <Button
            onClick={onStart}
            className="w-full h-32 text-4xl font-bold bg-purple-600 hover:bg-purple-700 shadow-xl"
          >
            EMPEZAR
          </Button>
        </div>
      </div>
    </div>
  );
}
