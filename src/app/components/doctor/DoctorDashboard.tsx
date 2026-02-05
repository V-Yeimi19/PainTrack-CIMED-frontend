import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Doctor } from '@/app/types';
import { mockPatients, getPatientRecords } from '@/app/data/mockData';
import { LogOut, User, Calendar, TrendingUp, AlertTriangle, Stethoscope, Activity, TrendingDown, BarChart3, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import ClinicalRow from '@/app/components/ui/clinicalRow';

interface DoctorDashboardProps {
  doctor: Doctor;
  onLogout: () => void;
}

export function DoctorDashboard({ doctor, onLogout }: DoctorDashboardProps) {
  const [selectedPatientDNI, setSelectedPatientDNI] = useState<string | null>(null);

  const selectedPatient = selectedPatientDNI 
    ? mockPatients.find(p => p.dni === selectedPatientDNI)
    : null;

  const selectedRecords = selectedPatientDNI 
    ? getPatientRecords(selectedPatientDNI)
    : [];

  const getPainColor = (level: number) => {
    if (level <= 2) return '#22c55e'; // green
    if (level <= 5) return '#eab308'; // yellow
    if (level <= 7) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getPatientStatus = (dni: string) => {
    const records = getPatientRecords(dni);
    if (records.length === 0) return 'stable';
    
    const lastRecord = records[records.length - 1];
    
    // Verificar tendencia
    if (records.length >= 2) {
      const previousRecord = records[records.length - 2];
      const increase = lastRecord.painLevel - previousRecord.painLevel;
      
      if (lastRecord.painLevel >= 8 || increase >= 3) return 'critical';
      if (lastRecord.painLevel >= 6 || increase >= 2) return 'warning';
    }
    
    if (lastRecord.painLevel >= 8) return 'critical';
    if (lastRecord.painLevel >= 6) return 'warning';
    return 'stable';
  };

  const getStatusColor = (status: string) => {
    if (status === 'critical') return 'bg-red-500';
    if (status === 'warning') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'critical') return 'Crítico';
    if (status === 'warning') return 'Alerta';
    return 'Estable';
  };

  // Gráfico de línea de evolución
  const chartData = selectedRecords.slice(-10).map(record => ({
    fecha: new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
    nivel: record.painLevel,
  }));

  // Contar pacientes por estado
  const criticalCount = mockPatients.filter(p => getPatientStatus(p.dni) === 'critical').length;
  const warningCount = mockPatients.filter(p => getPatientStatus(p.dni) === 'warning').length;
  const stableCount = mockPatients.filter(p => getPatientStatus(p.dni) === 'stable').length;

  // Detectar cambios bruscos
  const hasAbruptChange = (dni: string) => {
    const records = getPatientRecords(dni);
    if (records.length < 2) return false;
    const lastRecord = records[records.length - 1];
    const previousRecord = records[records.length - 2];
    return Math.abs(lastRecord.painLevel - previousRecord.painLevel) >= 3;
  };

  // Calcular estadísticas profesionales del paciente seleccionado
  const getPatientStats = () => {
    if (selectedRecords.length === 0) return null;
    
    const painLevels = selectedRecords.map(r => r.painLevel);
    const avgPain = (painLevels.reduce((a, b) => a + b, 0) / painLevels.length).toFixed(1);
    const maxPain = Math.max(...painLevels);
    const minPain = Math.min(...painLevels);
    
    // Calcular tendencia (últimos 7 días vs anteriores)
    const recentAvg = selectedRecords.length >= 7 
      ? (selectedRecords.slice(-7).reduce((sum, r) => sum + r.painLevel, 0) / 7).toFixed(1)
      : avgPain;
    
    const olderAvg = selectedRecords.length >= 14
      ? (selectedRecords.slice(-14, -7).reduce((sum, r) => sum + r.painLevel, 0) / 7).toFixed(1)
      : avgPain;
    
    const trend = parseFloat(recentAvg) - parseFloat(olderAvg);
    
    // Ubicaciones más afectadas
    const locationCounts: Record<string, number> = {};
    selectedRecords.forEach(r => {
      locationCounts[r.location] = (locationCounts[r.location] || 0) + 1;
    });
    const mostAffectedLocation = Object.entries(locationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Tipos de dolor más frecuentes
    const typeCounts: Record<string, number> = {};
    selectedRecords.forEach(r => {
      typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
    });
    const mostFrequentType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    // Distribución por ubicación (para gráfico de torta)
    const locationData = Object.entries(locationCounts).map(([name, value]) => ({
      name,
      value,
      fill: getPainColor(5)
    }));
    
    // Distribución por tipo de dolor
    const typeData = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    // Frecuencia de registros
    const daysWithRecords = new Set(selectedRecords.map(r => 
      new Date(r.date).toDateString()
    )).size;
    
    const totalDays = selectedRecords.length > 0
      ? Math.ceil((Date.now() - new Date(selectedRecords[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    
    const adherence = totalDays > 0 ? ((daysWithRecords / totalDays) * 100).toFixed(0) : '0';
    
    return { 
      avgPain, 
      maxPain, 
      minPain, 
      mostAffectedLocation, 
      mostFrequentType,
      trend,
      recentAvg,
      locationData,
      typeData,
      adherence
    };
  };

  const stats = selectedPatient ? getPatientStats() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header fijo */}
      <div className="bg-white shadow-lg px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-600 p-2 rounded-lg">
              <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-green-900">PainTrack CIMED</h2>
              <p className="text-xs sm:text-sm text-gray-600">{doctor.name}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="h-10 sm:h-12 px-3 sm:px-6 text-sm sm:text-base font-bold"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            SALIR
          </Button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Alertas globales */}
        {criticalCount > 0 && (
          <Alert className="mb-4 border-2 border-red-500 bg-red-50">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            <AlertDescription className="text-base sm:text-lg font-semibold text-red-900 ml-2">
              {criticalCount} paciente{criticalCount > 1 ? 's' : ''} en estado crítico
            </AlertDescription>
          </Alert>
        )}

        {/* Resumen rápido */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Card className="shadow-lg border-2 border-green-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-500"></div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">Estables</p>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-green-600">{stableCount}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-yellow-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-yellow-500"></div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">Alertas</p>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-yellow-600">{warningCount}</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-red-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500"></div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">Críticos</p>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-red-600">{criticalCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de pacientes */}
        <Card className="shadow-xl mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl sm:text-2xl font-bold text-green-900 flex items-center gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              Pacientes ({mockPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockPatients.map((patient) => {
                const status = getPatientStatus(patient.dni);
                const hasChange = hasAbruptChange(patient.dni);
                const records = getPatientRecords(patient.dni);
                const lastPain = records.length > 0 ? records[records.length - 1].painLevel : 0;
                
                return (
                  <button
                    key={patient.dni}
                    onClick={() => setSelectedPatientDNI(patient.dni)}
                    className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                      selectedPatientDNI === patient.dni 
                        ? 'bg-green-100 border-green-500 shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${getStatusColor(status)} flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <span className="text-base sm:text-lg font-bold block truncate">{patient.name}</span>
                          <span className="text-xs sm:text-sm text-gray-600">DNI: {patient.dni}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {hasChange && (
                          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        )}
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600">Último</p>
                          <p className="text-lg sm:text-xl font-bold" style={{ color: getPainColor(lastPain) }}>
                            {lastPain}/10
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detalles del paciente seleccionado */}
        {selectedPatient && stats ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Información básica */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold text-green-900 flex items-center justify-between">
                  <span className="truncate">Ficha Clínica del Paciente: {selectedPatient.name}</span>
                  <Badge className={`${getStatusColor(getPatientStatus(selectedPatient.dni))} text-white text-xs sm:text-sm px-2 sm:px-3 py-1 flex-shrink-0 ml-2`}>
                    {getStatusText(getPatientStatus(selectedPatient.dni))}
                  </Badge>
                </CardTitle>
              </CardHeader>
            <CardContent>
              <div className="text-sm sm:text-base">

                {/* ===== BLOQUE SUPERIOR 2 COLUMNAS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2">

                  {/* IZQUIERDA */}
                  <div className="md:border-r md:pr-6 space-y-3">
                    <ClinicalRow label="Nombre" value={selectedPatient.name} />
                    <ClinicalRow label="Sexo" value={selectedPatient.gender} />
                    <ClinicalRow label="Lugar de procedencia" value={selectedPatient.originPlace} />
                    <ClinicalRow label="Peso" value={`${selectedPatient.weight} kg`} />
                  </div>

                  {/* DERECHA */}
                  <div className="md:pl-6 space-y-3 mt-3 md:mt-0">
                    <ClinicalRow label="DNI" value={selectedPatient.dni} />
                    <ClinicalRow label="Edad" value={`${selectedPatient.age} años`} />
                    <ClinicalRow label="Idioma / Lengua originaria" value={selectedPatient.nativeLanguage.join(', ')} />
                    <ClinicalRow label="Talla" value={`${selectedPatient.height} m`} />
                  </div>

                </div>

                {/* ===== BLOQUE MÉDICO COMPLETO ===== */}
                <div className="border-t mt-6 pt-4 space-y-3">

                  {selectedPatient.caracter && (
                    <ClinicalRow
                      label="Carácter"
                      value={selectedPatient.caracter}
                      multiline
                    />
                  )}

                  {selectedPatient.pathology && (
                    <ClinicalRow
                      label="Patología (dolor crónico)"
                      value={selectedPatient.pathology.join(', ')}
                      multiline
                    />
                  )}

                  {selectedPatient.treatment && (
                    <ClinicalRow
                      label="Tratamiento actual"
                      value={selectedPatient.treatment.join(', ')}
                      multiline
                    />
                  )}

                </div>

                {/* ===== CITA DESTACADA ===== */}
                {selectedPatient.nextAppointment && (
                  <div className="border-t mt-6 pt-4">
                    <ClinicalRow
                      label="Próxima cita"
                      value={selectedPatient.nextAppointment.toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                      highlight
                    />
                  </div>
                )}

              </div>  
            </CardContent>
            </Card>

            {/* Estadísticas clave */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-green-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métricas Clínicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Promedio</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.avgPain}</p>
                    <p className="text-xs text-gray-500">/ 10</p>
                  </div>
                  
                  <div className="bg-red-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Máximo</p>
                    <p className="text-2xl sm:text-3xl font-bold text-red-700">{stats.maxPain}</p>
                    <p className="text-xs text-gray-500">/ 10</p>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Mínimo</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-700">{stats.minPain}</p>
                    <p className="text-xs text-gray-500">/ 10</p>
                  </div>
                  
                  <div className={`p-3 rounded-xl text-center ${
                    stats.trend > 0 ? 'bg-red-50' : stats.trend < 0 ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-xs text-gray-600 mb-1">Tendencia</p>
                    <div className="flex items-center justify-center gap-1">
                      {stats.trend > 0 ? (
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      ) : stats.trend < 0 ? (
                        <TrendingDown className="w-5 h-5 text-green-600" />
                      ) : (
                        <Activity className="w-5 h-5 text-gray-600" />
                      )}
                      <p className={`text-2xl sm:text-3xl font-bold ${
                        stats.trend > 0 ? 'text-red-700' : stats.trend < 0 ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {stats.trend > 0 ? '+' : ''}{stats.trend.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-3">
                  <div className="bg-orange-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Zona más afectada
                    </p>
                    <p className="text-base sm:text-lg font-bold text-orange-700">{stats.mostAffectedLocation}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-xl">
                    <p className="text-xs text-gray-600 mb-1">Tipo frecuente</p>
                    <p className="text-base sm:text-lg font-bold text-purple-700">{stats.mostFrequentType}</p>
                  </div>
                </div>

                <div className="bg-teal-50 p-3 rounded-xl mt-3">
                  <p className="text-xs text-gray-600 mb-1">Adherencia al registro</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{ width: `${stats.adherence}%` }}
                      ></div>
                    </div>
                    <p className="text-lg font-bold text-teal-700">{stats.adherence}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de evolución */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-green-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolución del Dolor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="fecha" 
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <YAxis 
                        domain={[0, 10]}
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Tooltip 
                        contentStyle={{ fontSize: '14px', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="nivel" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-lg text-gray-500">No hay datos disponibles</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribución por ubicación */}
            {stats.locationData.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-green-900">
                    Distribución por Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.locationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        style={{ fontSize: '10px' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {stats.locationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getPainColor(5 + index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Historial reciente */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-green-900">
                  Últimos 5 Registros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedRecords.slice().reverse().slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="bg-white p-3 rounded-xl border-2 border-gray-200"
                    >
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Fecha</p>
                          <p className="font-bold">
                            {new Date(record.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Nivel</p>
                          <p 
                            className="font-bold text-lg"
                            style={{ color: getPainColor(record.painLevel) }}
                          >
                            {record.painLevel}/10
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Ubicación del dolor</p>
                          <p className="font-bold">{record.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Tipo de dolor</p>
                          <p className="font-bold">{record.type}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
              <Button className="h-16 text-lg font-bold bg-purple-600 hover:bg-purple-700">
                RECOMENDAR CITA
              </Button>
              <Button variant="outline" className="h-16 text-lg font-bold">
                EXPORTAR HISTORIAL
              </Button>
            </div>
          </div>
        ) : (
          <Card className="shadow-xl">
            <CardContent className="py-24">
              <div className="text-center">
                <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">
                  Selecciona un paciente para ver su información
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
