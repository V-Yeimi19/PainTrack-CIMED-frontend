import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Doctor } from '@/app/types';
import { mockPatients, getPatientRecords, addPainRecord } from '@/app/data/mockData';
import { LogOut, User, Calendar, TrendingUp, AlertTriangle, Stethoscope, Activity, TrendingDown, BarChart3, MapPin, FileText, Edit2, Save, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import ClinicalRow from '@/app/components/ui/clinicalRow';
import { ConsultationForm, ConsultationData } from './ConsultationForm';
import BodyHeatmap from './BodyHeatmap';

interface DoctorDashboardProps {
  doctor: Doctor;
  onLogout: () => void;
}

export function DoctorDashboard({ doctor, onLogout }: DoctorDashboardProps) {
  const [selectedPatientDNI, setSelectedPatientDNI] = useState<string | null>(null);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [selectedZone, setSelectedZone] = useState<{ name: string; records: any[] } | null>(null);
  const [patients, setPatients] = useState(() => {
    // Cargar pacientes desde localStorage si existen
    const storedPatients = localStorage.getItem('patients');
    if (storedPatients) {
      try {
        const parsed = JSON.parse(storedPatients);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            nextAppointment: p.nextAppointment ? new Date(p.nextAppointment) : undefined,
            referralDataLastModified: p.referralDataLastModified ? new Date(p.referralDataLastModified) : undefined,
          }));
        }
      } catch (e) {
        console.error('Error loading patients from localStorage:', e);
      }
    }
    return mockPatients;
  });
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar actualización de registros
  const [showEditReferral, setShowEditReferral] = useState(false);
  const [referralData, setReferralData] = useState({ referringDoctor: '', whoRecommended: '' });

  const selectedPatient = selectedPatientDNI 
    ? patients.find(p => p.dni === selectedPatientDNI)
    : null;

  const selectedRecords = selectedPatientDNI 
    ? getPatientRecords(selectedPatientDNI)
    : [];

  const getPainColor = (value: number) => {
  // value: 0–1
  if (value >= 8) return "#aa0303ff";
  if (value >= 7) return "#ff0000";
  if (value >= 5) return "#ff7a00";
  if (value >= 3) return "#ffd000";
  if (value > 0) return "#00ca22ff";
  return "#e5e7eb";
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
    return 'bg-blue-500';
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
  const criticalCount = patients.filter(p => getPatientStatus(p.dni) === 'critical').length;
  const warningCount = patients.filter(p => getPatientStatus(p.dni) === 'warning').length;
  const stableCount = patients.filter(p => getPatientStatus(p.dni) === 'stable').length;

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

  // Función para calcular IMC y su categoría
  const calculateBMI = (weight: number, height: number) => {
    const bmi = weight / (height * height);
    let category = '';
    let color = '';

    if (bmi < 18.5) {
      category = 'Bajo peso';
      color = 'text-blue-600';
    } else if (bmi < 25) {
      category = 'Normal';
      color = 'text-blue-600';
    } else if (bmi < 30) {
      category = 'Sobrepeso';
      color = 'text-yellow-600';
    } else {
      category = 'Obesidad';
      color = 'text-red-600';
    }

    return { bmi: bmi.toFixed(1), category, color };
  };

  // Inicializar datos de referencia cuando se selecciona un paciente
  useEffect(() => {
    if (selectedPatient) {
      setReferralData({
        referringDoctor: selectedPatient.referringDoctor || '',
        whoRecommended: selectedPatient.whoRecommended || ''
      });
    }
  }, [selectedPatientDNI]);

  // Función para guardar datos de referencia
  const handleSaveReferralData = () => {
    if (selectedPatientDNI) {
      const now = new Date();
      const updatedPatients = patients.map(p => 
        p.dni === selectedPatientDNI 
          ? { ...p, referringDoctor: referralData.referringDoctor, whoRecommended: referralData.whoRecommended, referralDataLastModified: now }
          : p
      );
      setPatients(updatedPatients);
      
      // Guardar en localStorage
      const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
      const updatedStoredPatients = storedPatients.map((p: any) => 
        p.dni === selectedPatientDNI 
          ? { ...p, referringDoctor: referralData.referringDoctor, whoRecommended: referralData.whoRecommended, referralDataLastModified: now.toISOString() }
          : p
      );
      localStorage.setItem('patients', JSON.stringify(updatedStoredPatients));
      
      setShowEditReferral(false);
      alert('Datos de referencia guardados exitosamente');
    }
  };

  // Función para exportar historial a PDF
  const exportHistorialPDF = async () => {
    if (!selectedPatient || selectedRecords.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Importación dinámica de jsPDF y autoTable
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Función para convertir imagen a base64
      const getBase64Image = (imgUrl: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/png');
            resolve(dataURL);
          };
          img.onerror = reject;
          img.src = imgUrl;
        });
      };

      // Cargar y agregar logo
      try {
        const logoBase64 = await getBase64Image('/images/logo-cimed.png');

        // Encabezado con logo
        doc.setFillColor(59, 130, 246); // Azul
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Agregar logo en la esquina superior izquierda
        doc.addImage(logoBase64, 'PNG', 10, 10, 25, 25);

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL CLÍNICO', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.text('PainTrack CIMED', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 37, { align: 'center' });
      } catch (logoError) {
        // Si falla la carga del logo, continuar sin él
        console.error('Error al cargar logo:', logoError);

        doc.setFillColor(59, 130, 246); // Azul
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL CLÍNICO', pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.text('PainTrack CIMED', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 33, { align: 'center' });
      }

      // Información del paciente
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos del Paciente', 14, 52);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const bmiData = calculateBMI(selectedPatient.weight, selectedPatient.height);

      const patientInfo = [
        ['Nombre:', selectedPatient.name],
        ['DNI:', selectedPatient.dni],
        ['Edad:', `${selectedPatient.age} años`],
        ['Sexo:', selectedPatient.gender],
        ['Peso:', `${selectedPatient.weight} kg`],
      ['Talla:', `${selectedPatient.height} m`],
      ['IMC:', `${bmiData.bmi} (${bmiData.category})`],
      ['Ocupación:', selectedPatient.occupation || 'No especificado'],
      ['Idioma:', selectedPatient.nativeLanguage.join(', ')],
    ];

      if (selectedPatient.referringDoctor) {
        patientInfo.push(['Médico Referente:', selectedPatient.referringDoctor]);
      }
      if (selectedPatient.whoRecommended) {
        patientInfo.push(['Recomendado por:', selectedPatient.whoRecommended]);
      }

      autoTable(doc, {
        startY: 57,
        body: patientInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        }
      });

      // Estadísticas
      const finalY = (doc as any).lastAutoTable.finalY || 57;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Estadístico', 14, finalY + 15);

    if (stats) {
      const statsInfo = [
        ['Dolor Promedio:', `${stats.avgPain}/10`],
        ['Dolor Máximo:', `${stats.maxPain}/10`],
        ['Dolor Mínimo:', `${stats.minPain}/10`],
        ['Ubicación más afectada:', stats.mostAffectedLocation],
        ['Tipo de dolor más frecuente:', stats.mostFrequentType],
        ['Total de registros:', `${selectedRecords.length}`],
      ];

      autoTable(doc, {
        startY: finalY + 20,
        body: statsInfo,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 70 },
          1: { cellWidth: 'auto' }
        }
      });
    }

    // Historial de registros
    const historyStartY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Registros', 14, historyStartY);

    const tableData = selectedRecords.map(record => [
      new Date(record.date).toLocaleDateString('es-ES'),
      record.painLevel.toString(),
      record.location,
      record.type,
      record.notes || '-'
    ]);

    autoTable(doc, {
      startY: historyStartY + 5,
      head: [['Fecha', 'Nivel', 'Ubicación', 'Tipo', 'Notas']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      }
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Atendido por: ${doctor.name}`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    }

      // Guardar PDF
      doc.save(`Historial_${selectedPatient.name}_${selectedPatient.dni}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header fijo */}
      <div className="bg-white shadow-lg px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-blue-900">PainTrack CIMED</h2>
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
          <Card className="shadow-lg border-2 border-blue-300">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-blue-500"></div>
                <p className="text-xs sm:text-sm font-bold text-gray-700">Estables</p>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-blue-600">{stableCount}</p>
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
            <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900 flex items-center gap-2">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
              Pacientes ({mockPatients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patients.map((patient) => {
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
                        ? 'bg-blue-100 border-blue-500 shadow-lg' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
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

        {/* Formulario de Consulta */}
        {showConsultationForm && selectedPatient && (
          <ConsultationForm
            patient={selectedPatient}
            onSave={(data: ConsultationData) => {
              // Guardar nuevo registro de dolor
              if (data.painLocation && data.painLevel !== undefined) {
                // Solo guardar el dolor si no se ha guardado antes (primera vez)
                if (data.conclusivePathology === undefined) {
                  addPainRecord({
                    patientDNI: selectedPatient.dni,
                    date: new Date(),
                    painLevel: data.painLevel,
                    location: data.painLocation,
                    type: 'Molesto', // Valor por defecto, se puede ajustar
                    painDuration: data.painDuration,
                    painCause: data.painCause,
                  });
                  
                  // Forzar actualización de los registros
                  setRefreshKey(prev => prev + 1);
                  
                  // No cerrar el formulario aquí, dejar que aparezca la sección de patología concluyente
                  return;
                }
                
                // Si hay patología concluyente, agregarla al array de pathology del paciente
                if (data.conclusivePathology && data.conclusivePathology.trim()) {
                  const updatedPatients = patients.map(p => {
                    if (p.dni === selectedPatient.dni) {
                      const currentPathology = p.pathology || [];
                      // Evitar duplicados
                      if (!currentPathology.includes(data.conclusivePathology.trim())) {
                        return {
                          ...p,
                          pathology: [...currentPathology, data.conclusivePathology.trim()]
                        };
                      }
                      return p;
                    }
                    return p;
                  });
                  setPatients(updatedPatients);
                  
                  // Guardar en localStorage
                  const storedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
                  const updatedStoredPatients = storedPatients.map((p: any) => {
                    if (p.dni === selectedPatient.dni) {
                      const currentPathology = p.pathology || [];
                      if (!currentPathology.includes(data.conclusivePathology.trim())) {
                        return {
                          ...p,
                          pathology: [...currentPathology, data.conclusivePathology.trim()]
                        };
                      }
                    }
                    return p;
                  });
                  localStorage.setItem('patients', JSON.stringify(updatedStoredPatients));
                  
                  alert('Dolor y patología concluyente guardados exitosamente');
                } else if (data.conclusivePathology === '') {
                  // Si se omite la patología concluyente (string vacío), solo cerrar
                  alert('Dolor registrado exitosamente');
                }
                
                setShowConsultationForm(false);
              } else {
                alert('Por favor complete todos los campos requeridos (ubicación y nivel de dolor)');
              }
            }}
            onCancel={() => setShowConsultationForm(false)}
          />
        )}

        {/* Detalles del paciente seleccionado */}
        {selectedPatient && stats && !showConsultationForm ? (
          <div className="space-y-4 sm:space-y-6">
            {/* Botón para registrar nuevo dolor */}
            <Card className="shadow-xl bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <Button
                  onClick={() => setShowConsultationForm(true)}
                  className="w-full h-16 text-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-lg"
                >
                  <FileText className="w-6 h-6 mr-2" />
                  Registrar Nuevo Dolor
                </Button>
              </CardContent>
            </Card>

            {/* Información básica */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl sm:text-2xl font-bold text-blue-900 flex items-center justify-between">
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
                    <ClinicalRow label="N° Hijos" value={selectedPatient.numberOfChildren || 'No especificado'} />
                    <ClinicalRow label="Nivel Educativo" value={selectedPatient.educationLevel || 'No especificado'} />
                  </div>

                  {/* DERECHA */}
                  <div className="md:pl-6 space-y-3 mt-3 md:mt-0">
                    <ClinicalRow label="DNI" value={selectedPatient.dni} />
                    <ClinicalRow label="Edad" value={`${selectedPatient.age} años`} />
                    <ClinicalRow label="Idioma / Lengua originaria" value={selectedPatient.nativeLanguage.join(', ')} />
                    <ClinicalRow label="Talla" value={`${selectedPatient.height} m`} />
                    <ClinicalRow
                      label="IMC"
                      value={(() => {
                        const bmiData = calculateBMI(selectedPatient.weight, selectedPatient.height);
                        return `${bmiData.bmi} (${bmiData.category})`;
                      })()}
                    />
                    <ClinicalRow label="Ocupación" value={selectedPatient.occupation || 'No especificado'} />
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

                  {selectedPatient.pathology && selectedPatient.pathology.length > 0 && (
                    <div>
                      <label className="text-sm sm:text-base font-semibold text-gray-700 mb-2 block">
                        Patología (dolor crónico)
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedPatient.pathology.map((path, index) => (
                          <Badge 
                            key={index}
                            className="bg-purple-100 text-purple-800 hover:bg-purple-200 px-3 py-1 text-sm font-medium"
                          >
                            {path}
                          </Badge>
                        ))}
                      </div>
                    </div>
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

                {/* ===== SECCIÓN DE REFERENCIA (EDITABLE) ===== */}
                <div className="border-t mt-6 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-blue-900">Información de Referencia</h3>
                    {!showEditReferral && (
                      <Button
                        onClick={() => setShowEditReferral(true)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                  </div>

                  {showEditReferral ? (
                    <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
                      <div>
                        <Label htmlFor="referringDoctor" className="text-base font-semibold text-gray-700">
                          Médico que refiere al paciente:
                        </Label>
                        <Input
                          id="referringDoctor"
                          value={referralData.referringDoctor}
                          onChange={(e) => setReferralData({ ...referralData, referringDoctor: e.target.value })}
                          className="mt-2 h-10 text-base"
                          placeholder="Ej: Dr. Juan Pérez"
                        />
                      </div>

                      <div>
                        <Label htmlFor="whoRecommended" className="text-base font-semibold text-gray-700">
                          Quién le recomendó nuestro centro:
                        </Label>
                        <Input
                          id="whoRecommended"
                          value={referralData.whoRecommended}
                          onChange={(e) => setReferralData({ ...referralData, whoRecommended: e.target.value })}
                          className="mt-2 h-10 text-base"
                          placeholder="Ej: Amigo, familiar, otro médico, etc."
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => {
                            setShowEditReferral(false);
                            // Restaurar valores originales
                            if (selectedPatient) {
                              setReferralData({
                                referringDoctor: selectedPatient.referringDoctor || '',
                                whoRecommended: selectedPatient.whoRecommended || ''
                              });
                            }
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveReferralData}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <ClinicalRow 
                        label="Médico que refiere al paciente" 
                        value={selectedPatient.referringDoctor || 'No especificado'} 
                      />
                      <ClinicalRow 
                        label="Quién le recomendó nuestro centro" 
                        value={selectedPatient.whoRecommended || 'No especificado'} 
                      />
                      {selectedPatient.referralDataLastModified && (
                        <p className="text-xs text-gray-400 opacity-60 mt-2 italic">
                          Última modificación: {selectedPatient.referralDataLastModified.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>  
            </CardContent>
            </Card>

            {/* Estadísticas clave */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2">
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
                  
                  <div className="bg-blue-50 p-3 rounded-xl text-center">
                    <p className="text-xs text-gray-600 mb-1">Mínimo</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.minPain}</p>
                    <p className="text-xs text-gray-500">/ 10</p>
                  </div>
                  
                  <div className={`p-3 rounded-xl text-center ${
                    stats.trend > 0 ? 'bg-red-50' : stats.trend < 0 ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    <p className="text-xs text-gray-600 mb-1">Tendencia</p>
                    <div className="flex items-center justify-center gap-1">
                      {stats.trend > 0 ? (
                        <TrendingUp className="w-5 h-5 text-red-600" />
                      ) : stats.trend < 0 ? (
                        <TrendingDown className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Activity className="w-5 h-5 text-gray-600" />
                      )}
                      <p className={`text-2xl sm:text-3xl font-bold ${
                        stats.trend > 0 ? 'text-red-700' : stats.trend < 0 ? 'text-blue-700' : 'text-gray-700'
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
                <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2">
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

            {/* Mapa de calor corporal - Distribución por ubicación */}
            {stats.locationData.length > 0 && (
              <Card className="shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl font-bold text-blue-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Mapa de Calor Corporal - Distribución por Ubicación
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Las zonas más rojas indican mayor frecuencia de dolor. Haz clic en una zona para ver los detalles.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Mapa de calor */}
                    <div className="flex-1">
                      <BodyHeatmap
                        records={selectedRecords}
                        onZoneClick={(zoneName, zoneRecords) => {
                          if (zoneRecords.length > 0) {
                            setSelectedZone({ name: zoneName, records: zoneRecords });
                          }
                        }}
                      />
                    </div>

                    {/* Leyenda lateral con información de la zona seleccionada */}
                    <div className="lg:w-80 space-y-4">
                      {/* Leyenda de colores */}
                      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <p className="text-sm font-bold text-gray-700 mb-3">Leyenda de intensidad:</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
                            <span className="text-xs">Sin datos</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#7bd389' }}></div>
                            <span className="text-xs">Baja intensidad</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ffd000' }}></div>
                            <span className="text-xs">Media intensidad</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ff7a00' }}></div>
                            <span className="text-xs">Alta intensidad</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ff0000' }}></div>
                            <span className="text-xs">Muy alta intensidad</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded" style={{ backgroundColor: '#8b0000' }}></div>
                            <span className="text-xs">Intensidad crítica</span>
                          </div>
                        </div>
                      </div>

                      {/* Información de zona seleccionada */}
                      {selectedZone ? (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-blue-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              Zona Seleccionada
                            </h4>
                            <button
                              onClick={() => setSelectedZone(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Ubicación</p>
                              <p className="text-base font-bold text-gray-900">{selectedZone.name}</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Total de registros</p>
                              <p className="text-2xl font-bold text-blue-700">{selectedZone.records.length}</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Nivel promedio de dolor</p>
                              <p className="text-2xl font-bold" style={{
                                color: getPainColor(
                                  Math.round(selectedZone.records.reduce((sum, r) => sum + r.painLevel, 0) / selectedZone.records.length)
                                )
                              }}>
                                {(selectedZone.records.reduce((sum, r) => sum + r.painLevel, 0) / selectedZone.records.length).toFixed(1)}/10
                              </p>
                            </div>

                            {/* Últimos 3 registros de esta zona */}
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-2">Últimos registros</p>
                              <div className="space-y-2">
                                {selectedZone.records.slice(-3).reverse().map((record, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs border-b border-gray-100 pb-1">
                                    <span className="text-gray-600">
                                      {new Date(record.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                    </span>
                                    <span className="font-bold" style={{ color: getPainColor(record.painLevel) }}>
                                      {record.painLevel}/10
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
                          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            Haz clic en una zona del mapa para ver los detalles
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Historial reciente */}
            <Card className="shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
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
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-600">Fecha</p>
                            <p className="font-bold text-base">
                              {new Date(record.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
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
                            <p className="font-bold text-base">{record.location}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Tipo de dolor</p>
                            <p className="font-bold text-base">{record.type}</p>
                          </div>
                        </div>
                        {record.painDuration && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-gray-600">Por cuánto tiempo tiene este dolor</p>
                            <p className="font-bold text-base">{record.painDuration}</p>
                          </div>
                        )}
                        {record.painCause && (
                          <div className="border-t pt-2">
                            <p className="text-xs text-gray-600 mb-1">Causa del dolor</p>
                            <div className="flex flex-wrap gap-2">
                              {record.painCause.lesion && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">Lesión</span>}
                              {record.painCause.herida && <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">Herida</span>}
                              {record.painCause.golpe && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">Golpe</span>}
                              {record.painCause.noSabe && <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-semibold">No sabe</span>}
                            </div>
                          </div>
                        )}
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
              <Button onClick={exportHistorialPDF} variant="outline" className="h-16 text-lg font-bold">
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
