import { Button } from '@/app/components/ui/button';

interface WelcomeProps {
  onStart: () => void;
  patientName?: string;
}

export function Welcome({ onStart, patientName }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(270,30%,98%)] via-[hsl(270,35%,92%)] to-[hsl(270,20%,96%)] flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Elementos decorativos sutiles de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(270,70%,50%)] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(270,60%,60%)] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl lg:max-w-3xl text-center space-y-16 sm:space-y-20 lg:space-y-12 relative z-10">
        {/* Logo con efecto sutil */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(270,70%,50%)] to-[hsl(270,60%,60%)] opacity-10 rounded-full blur-2xl scale-110"></div>
            <img 
              src="/images/logo-cimed.png" 
              alt="PainTrack CIMED Logo" 
              className="h-32 sm:h-40 lg:h-36 xl:h-40 w-auto object-contain relative drop-shadow-lg"
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-8 sm:space-y-10 lg:space-y-6">
          <div className="space-y-6 lg:space-y-4">
            <h1 className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[1.05] tracking-tight">
              {patientName ? (
                <>
                  <span className="text-white drop-shadow-[0_8px_16px_rgba(147,51,234,0.2),0_4px_8px_rgba(147,51,234,0.15)]">
                    Hola
                  </span>
                  <br />
                  <span className="text-[hsl(270,70%,40%)] bg-gradient-to-r from-[hsl(270,70%,40%)] to-[hsl(270,70%,50%)] bg-clip-text text-transparent font-bold text-7xl sm:text-8xl lg:text-7xl xl:text-8xl">
                    {patientName.split(' ')[0]}
                  </span>
                </>
              ) : (
                <span className="text-white drop-shadow-[0_8px_16px_rgba(147,51,234,0.2),0_4px_8px_rgba(147,51,234,0.15)]">
                  Hola
                </span>
              )}
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl text-gray-600 font-normal leading-relaxed max-w-xl lg:max-w-lg mx-auto px-4 tracking-tight">
              Vamos a registrar cómo te sientes hoy
            </p>
          </div>
        </div>

        {/* Botón CTA moderno */}
        <div className="pt-6 lg:pt-4">
          <Button
            onClick={onStart}
            className="w-full max-w-xs mx-auto h-12 sm:h-14 md:h-16 lg:h-18 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white bg-gradient-to-r from-[hsl(270,70%,50%)] via-[hsl(270,70%,48%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,70%,45%)] hover:via-[hsl(270,70%,43%)] hover:to-[hsl(270,70%,40%)] rounded-2xl shadow-[0_4px_20px_rgba(147,51,234,0.3),0_0_0_1px_rgba(147,51,234,0.1)] hover:shadow-[0_8px_30px_rgba(147,51,234,0.4),0_0_0_1px_rgba(147,51,234,0.15)] transition-all duration-100 ease-out transform hover:scale-[1.02] active:scale-[0.98] border-0"
          >
            EMPEZAR
          </Button>
        </div>
      </div>
    </div>
  );
}
