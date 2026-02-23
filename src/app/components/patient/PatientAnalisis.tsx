import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ArrowLeft, Image, Droplets } from 'lucide-react';

interface PatientAnalisisProps {
  patient: { name: string };
  onBack: () => void;
}

export function PatientAnalisis({ patient, onBack }: PatientAnalisisProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="h-12 sm:h-16 px-4 sm:px-6 text-xl sm:text-2xl font-bold"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            VOLVER
          </Button>
          <h1 className="text-3xl sm:text-5xl font-bold text-purple-900">
            Mis análisis
          </h1>
        </div>

        <div className="space-y-8">
          {/* Placas (Rayos X) */}
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-3">
                <Image className="w-8 h-8 sm:w-10 sm:h-10" />
                Placas
              </CardTitle>
              <p className="text-base sm:text-lg text-gray-600 mt-1">
                Rayos X de rodilla y espalda
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-purple-800">Placa de rodilla</p>
                  <div className="rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-md">
                    <img
                      src="/images/rodilla.jpg"
                      alt="Placa de rodilla"
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-purple-800">Placa de espalda</p>
                  <div className="rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-md">
                    <img
                      src="/images/Placa_espalda.jpg"
                      alt="Placa de espalda"
                      className="w-full h-auto object-contain max-h-[400px]"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de sangre */}
          <Card className="shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-3">
                <Droplets className="w-8 h-8 sm:w-10 sm:h-10" />
                Análisis de sangre
              </CardTitle>
              <p className="text-base sm:text-lg text-gray-600 mt-1">
                Resultados de laboratorio
              </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-md">
                <img
                  src="/images/resultados.png"
                  alt="Resultados de análisis de sangre"
                  className="w-full h-auto object-contain max-h-[600px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
