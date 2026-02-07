import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Checkbox } from '@/app/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Patient, PainLevel, PainLocation } from '@/app/types';
import { BodyMap } from '@/app/components/patient/BodyMap';
import { Save, X } from 'lucide-react';

interface ConsultationFormProps {
  patient: Patient;
  onSave: (data: ConsultationData) => void;
  onCancel: () => void;
}

export interface ConsultationData {
  numberOfChildren?: string;
  educationLevel?: string;
  occupation?: string;
  referringDoctor?: string;
  whoRecommended?: string;
  painDuration?: string;
  painLocation?: PainLocation;
  painCause?: {
    lesion?: boolean;
    herida?: boolean;
    golpe?: boolean;
    noSabe?: boolean;
  };
  painLevel?: PainLevel;
  painLocationMap?: PainLocation[];
  customPoints?: any[];
  conclusivePathology?: string; // Patología concluyente después de registrar el dolor
  
  // Nuevos campos del cuestionario médico extenso
  painDescription?: string[]; // Adjetivos para describir el dolor
  painDescriptionOther?: string;
  painConstant?: boolean; // El dolor es constante
  painComesAndGoes?: boolean; // El dolor va y viene
  painWorsensDay?: boolean; // El dolor empeora de día
  painWorsensNight?: boolean; // El dolor empeora de noche
  painStatus?: 'mejorando' | 'empeorando' | 'igual'; // Estado del dolor
  factorsWorsen?: string[]; // Factores que empeoran el dolor
  factorsWorsenOther?: string;
  factorsImprove?: string[]; // Factores que mejoran el dolor
  factorsImproveOther?: string;
  activitiesAffected?: string[]; // Actividades afectadas
  activitiesAffectedOther?: string;
  emotionalImpact?: string[]; // Impacto emocional
  emotionalImpactOther?: string;
  treatmentsReceived?: {
    cirugia?: { received: boolean; details?: string };
    terapiaFisica?: { received: boolean; details?: string };
    quiropractico?: { received: boolean; details?: string };
    bloqueos?: { received: boolean; details?: string };
    acupuntura?: { received: boolean; details?: string };
    ozonoterapia?: { received: boolean; details?: string };
    otros?: string;
  };
  testsPerformed?: {
    rayosX?: { performed: boolean; when?: string };
    tomografia?: { performed: boolean; when?: string };
    resonancia?: { performed: boolean; when?: string };
    gamagrafia?: { performed: boolean; when?: string };
    electromiografia?: { performed: boolean; when?: string };
    otros?: string;
  };
  medications?: string; // Medicamentos para el dolor
  medicationsHelp?: string; // Cuál mejora
  medicationsNoHelp?: string; // Cuál no ayuda
  otherMedications?: string; // Medicamentos para otras dolencias
  anticoagulants?: string; // Anticoagulantes
  contrastAllergy?: string; // Alergia a contraste yodado
  smoking?: { smokes: boolean; frequency?: string; helpsPain?: boolean };
  alcohol?: { drinks: boolean; frequency?: string; helpsPain?: boolean };
  drugs?: {
    marihuana?: boolean;
    cocaina?: boolean;
    masticaCoca?: boolean;
    otros?: string;
  };
  psychologicalTreatment?: {
    received: boolean;
    medication?: string;
  };
  consultationReason?: string; // Motivo de consulta
  illnessDuration?: string; // Tiempo de enfermedad
  currentEpisode?: string; // Episodio actual
  narrative?: string; // Relato
}

export function ConsultationForm({ patient, onSave, onCancel }: ConsultationFormProps) {
  const [formData, setFormData] = useState<ConsultationData>({
    painDuration: '',
    painCause: {
      lesion: false,
      herida: false,
      golpe: false,
      noSabe: false,
    },
    painLevel: 0,
    painLocationMap: [],
    customPoints: [],
    painLocation: undefined,
    painDescription: [],
    painDescriptionOther: '',
    factorsWorsen: [],
    factorsWorsenOther: '',
    factorsImprove: [],
    factorsImproveOther: '',
    activitiesAffected: [],
    activitiesAffectedOther: '',
    emotionalImpact: [],
    emotionalImpactOther: '',
    treatmentsReceived: {},
    testsPerformed: {},
    medications: '',
    medicationsHelp: '',
    medicationsNoHelp: '',
    otherMedications: '',
    anticoagulants: '',
    contrastAllergy: '',
    smoking: { smokes: false, frequency: '', helpsPain: false },
    alcohol: { drinks: false, frequency: '', helpsPain: false },
    drugs: {},
    psychologicalTreatment: { received: false, medication: '' },
    consultationReason: '',
    illnessDuration: '',
    currentEpisode: '',
    narrative: '',
  });

  const [selectedLocation, setSelectedLocation] = useState<PainLocation | null>(null);
  const [painSaved, setPainSaved] = useState(false);
  const [conclusivePathology, setConclusivePathology] = useState('');

  const handleInputChange = (field: keyof ConsultationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePainCauseChange = (cause: 'lesion' | 'herida' | 'golpe' | 'noSabe', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      painCause: {
        ...prev.painCause,
        [cause]: checked,
      },
    }));
  };

  const handleLocationSelect = (location: PainLocation) => {
    setSelectedLocation(location);
    handleInputChange('painLocation', location);
    if (!formData.painLocationMap?.includes(location)) {
      handleInputChange('painLocationMap', [...(formData.painLocationMap || []), location]);
    }
  };

  const handlePainLevelChange = (level: PainLevel) => {
    handleInputChange('painLevel', level);
  };

  // Funciones helper para manejar arrays
  const handleArrayToggle = (field: 'painDescription' | 'factorsWorsen' | 'factorsImprove' | 'activitiesAffected' | 'emotionalImpact', value: string) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    handleInputChange(field, updated);
  };

  const handleSubmit = () => {
    if (formData.painLocation && formData.painLevel !== undefined) {
      // Guardar el dolor primero
      onSave({ ...formData, conclusivePathology: undefined });
      setPainSaved(true);
    } else {
      alert('Por favor complete todos los campos requeridos (ubicación y nivel de dolor)');
    }
  };

  const handleSaveConclusivePathology = () => {
    if (conclusivePathology.trim()) {
      // Guardar patología concluyente y cerrar
      onSave({ ...formData, conclusivePathology: conclusivePathology.trim() });
    } else {
      // Si no hay patología concluyente, solo cerrar (usar string vacío para indicar que se omite)
      onSave({ ...formData, conclusivePathology: '' });
    }
    setPainSaved(false);
    setConclusivePathology('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="bg-green-600 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold">
                Registrar Nuevo Dolor - {patient.name}
              </CardTitle>
              <Button
                onClick={onCancel}
                variant="outline"
                className="bg-white hover:bg-gray-100"
              >
                <X className="w-5 h-5 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Información del Dolor */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Información del Dolor</h3>
              
              <div>
                <Label htmlFor="painDuration" className="text-lg font-semibold text-gray-700">
                  1) Por cuánto tiempo tiene este dolor:
                </Label>
                <Input
                  id="painDuration"
                  value={formData.painDuration || ''}
                  onChange={(e) => handleInputChange('painDuration', e.target.value)}
                  className="mt-2 h-12 text-lg"
                  placeholder="Ej: 3 meses, 1 año, etc."
                />
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-700 mb-2 block">
                  2) Dónde se localiza su dolor:
                </Label>
                <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                  <BodyMap
                    gender={patient.gender === 'Hombre' ? 'hombre' : patient.gender === 'Mujer' ? 'mujer' : 'hombre'}
                    registeredLocations={formData.painLocationMap || []}
                    customPoints={formData.customPoints || []}
                    onSelect={handleLocationSelect}
                    onCustomPointsChange={(points) => handleInputChange('customPoints', points)}
                  />
                </div>
                {selectedLocation && (
                  <p className="mt-2 text-lg text-gray-700">
                    Ubicación seleccionada: <span className="font-bold">{selectedLocation}</span>
                  </p>
                )}
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-700 mb-2 block">
                  3) Su dolor es resultado de:
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.painCause?.lesion || false}
                      onChange={(e) => handlePainCauseChange('lesion', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">Lesión</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.painCause?.herida || false}
                      onChange={(e) => handlePainCauseChange('herida', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">Herida</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.painCause?.golpe || false}
                      onChange={(e) => handlePainCauseChange('golpe', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">Golpe</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <input
                      type="checkbox"
                      checked={formData.painCause?.noSabe || false}
                      onChange={(e) => handlePainCauseChange('noSabe', e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg">No sabe</span>
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold text-gray-700 mb-2 block">
                  4) En la siguiente figura marque la intensidad a su dolor:
                </Label>
                <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                  <div className="mb-4">
                    <p className="text-xl font-semibold text-gray-700 mb-4 text-center">
                      Nivel de dolor: {formData.painLevel || 0}/10
                    </p>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={formData.painLevel || 0}
                      onChange={(e) => handlePainLevelChange(parseInt(e.target.value) as PainLevel)}
                      className="w-full h-6 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, 
                          #22c55e 0%, 
                          #22c55e 20%, 
                          #eab308 20%, 
                          #eab308 50%, 
                          #f97316 50%, 
                          #f97316 70%, 
                          #ef4444 70%, 
                          #ef4444 100%)`
                      }}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {[
                      { emoji: '😊', label: 'Sin dolor', levels: '0-2' },
                      { emoji: '🙂', label: 'Dolor leve', levels: '3-5' },
                      { emoji: '😣', label: 'Dolor moderado', levels: '6-7' },
                      { emoji: '😫', label: 'Dolor fuerte', levels: '8-10' },
                    ].map((item, idx) => {
                      const minLevel = idx === 0 ? 0 : idx === 1 ? 3 : idx === 2 ? 6 : 8;
                      return (
                        <button
                          key={idx}
                          onClick={() => handlePainLevelChange(minLevel as PainLevel)}
                          className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
                        >
                          <div className="text-4xl mb-2">{item.emoji}</div>
                          <div className="text-sm font-semibold text-gray-700">{item.label}</div>
                          <div className="text-xs text-gray-500 mt-1">EVA {item.levels}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Cuestionario Médico Extenso */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Cuestionario Médico Completo</h3>
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="description">Descripción</TabsTrigger>
                  <TabsTrigger value="factors">Factores</TabsTrigger>
                  <TabsTrigger value="treatments">Tratamientos</TabsTrigger>
                  <TabsTrigger value="lifestyle">Estilo de Vida</TabsTrigger>
                </TabsList>

                {/* Tab 1: Descripción del Dolor */}
                <TabsContent value="description" className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold text-gray-700 mb-3 block">
                      Como describiría su dolor:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {['Apretado', 'Punzante', 'Pulsátil', 'Corriente', 'Quemante', 'Ardor', 'Calambre', 'Cólico', 'Sordo', 'Tirante'].map((desc) => (
                        <label key={desc} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <Checkbox
                            checked={formData.painDescription?.includes(desc) || false}
                            onCheckedChange={(checked) => handleArrayToggle('painDescription', desc)}
                          />
                          <span className="text-sm">{desc}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="painDescriptionOther" className="text-sm text-gray-600">Otro:</Label>
                      <Input
                        id="painDescriptionOther"
                        value={formData.painDescriptionOther || ''}
                        onChange={(e) => handleInputChange('painDescriptionOther', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique otro..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-2 block">6) El dolor es constante:</Label>
                      <RadioGroup
                        value={formData.painConstant === true ? 'si' : formData.painConstant === false ? 'no' : undefined}
                        onValueChange={(value) => handleInputChange('painConstant', value === 'si')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="constant-si" />
                          <Label htmlFor="constant-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="constant-no" />
                          <Label htmlFor="constant-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-2 block">7) El dolor va y viene:</Label>
                      <RadioGroup
                        value={formData.painComesAndGoes === true ? 'si' : formData.painComesAndGoes === false ? 'no' : undefined}
                        onValueChange={(value) => handleInputChange('painComesAndGoes', value === 'si')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="comes-si" />
                          <Label htmlFor="comes-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="comes-no" />
                          <Label htmlFor="comes-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-2 block">8) El dolor empeora de día:</Label>
                      <RadioGroup
                        value={formData.painWorsensDay === true ? 'si' : formData.painWorsensDay === false ? 'no' : undefined}
                        onValueChange={(value) => handleInputChange('painWorsensDay', value === 'si')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="day-si" />
                          <Label htmlFor="day-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="day-no" />
                          <Label htmlFor="day-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-2 block">9) El dolor empeora de noche:</Label>
                      <RadioGroup
                        value={formData.painWorsensNight === true ? 'si' : formData.painWorsensNight === false ? 'no' : undefined}
                        onValueChange={(value) => handleInputChange('painWorsensNight', value === 'si')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="night-si" />
                          <Label htmlFor="night-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="night-no" />
                          <Label htmlFor="night-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-base font-semibold text-gray-700 mb-2 block">10) El dolor está:</Label>
                      <RadioGroup
                        value={formData.painStatus}
                        onValueChange={(value) => handleInputChange('painStatus', value as 'mejorando' | 'empeorando' | 'igual')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="mejorando" id="status-mejorando" />
                          <Label htmlFor="status-mejorando">Mejorando</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="empeorando" id="status-empeorando" />
                          <Label htmlFor="status-empeorando">Empeorando</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="igual" id="status-igual" />
                          <Label htmlFor="status-igual">Igual</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      13) Su dolor interfiere con algunas de las siguientes actividades:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Sueño', 'Trabajo', 'Estudio', 'Quehaceres de casa', 'Sexo'].map((activity) => (
                        <label key={activity} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <Checkbox
                            checked={formData.activitiesAffected?.includes(activity) || false}
                            onCheckedChange={(checked) => handleArrayToggle('activitiesAffected', activity)}
                          />
                          <span className="text-sm">{activity}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="activitiesAffectedOther" className="text-sm text-gray-600">Otro:</Label>
                      <Input
                        id="activitiesAffectedOther"
                        value={formData.activitiesAffectedOther || ''}
                        onChange={(e) => handleInputChange('activitiesAffectedOther', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique otro..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      14) El dolor lo hace sentir:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Deprimido', 'Irritable', 'Triste', 'Frustrado', 'Desamparado', 'No lo perturba'].map((emotion) => (
                        <label key={emotion} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <Checkbox
                            checked={formData.emotionalImpact?.includes(emotion) || false}
                            onCheckedChange={(checked) => handleArrayToggle('emotionalImpact', emotion)}
                          />
                          <span className="text-sm">{emotion}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="emotionalImpactOther" className="text-sm text-gray-600">Otro:</Label>
                      <Input
                        id="emotionalImpactOther"
                        value={formData.emotionalImpactOther || ''}
                        onChange={(e) => handleInputChange('emotionalImpactOther', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique otro..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Factores que afectan el dolor */}
                <TabsContent value="factors" className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      11) Qué situación o factor empeora su dolor:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Sentado', 'Parado', 'Caminando', 'Acostado', 'Ejercicios', 'Doblarse', 'Estirarse', 'Tos o estornudo', 'Sexo'].map((factor) => (
                        <label key={factor} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <Checkbox
                            checked={formData.factorsWorsen?.includes(factor) || false}
                            onCheckedChange={(checked) => handleArrayToggle('factorsWorsen', factor)}
                          />
                          <span className="text-sm">{factor}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="factorsWorsenOther" className="text-sm text-gray-600">Otros:</Label>
                      <Input
                        id="factorsWorsenOther"
                        value={formData.factorsWorsenOther || ''}
                        onChange={(e) => handleInputChange('factorsWorsenOther', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique otros..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      12) Qué situación o factor mejora su dolor:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Sentarse', 'Pararse', 'Caminar', 'Acostarse', 'Estirarse', 'Doblarse', 'Frotarse/Calor', 'Frío', 'Pastillas', 'Inyecciones'].map((factor) => (
                        <label key={factor} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                          <Checkbox
                            checked={formData.factorsImprove?.includes(factor) || false}
                            onCheckedChange={(checked) => handleArrayToggle('factorsImprove', factor)}
                          />
                          <span className="text-sm">{factor}</span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="factorsImproveOther" className="text-sm text-gray-600">Otros:</Label>
                      <Input
                        id="factorsImproveOther"
                        value={formData.factorsImproveOther || ''}
                        onChange={(e) => handleInputChange('factorsImproveOther', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique otros..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Tratamientos y Pruebas */}
                <TabsContent value="treatments" className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      15) Ha recibido algunos de estos tratamientos para su dolor (si es Sí, cuándo y cuántas veces):
                    </Label>
                    <div className="space-y-3">
                      {[
                        { key: 'cirugia', label: 'Cirugía' },
                        { key: 'terapiaFisica', label: 'Terapia física' },
                        { key: 'quiropractico', label: 'Quiropráctico' },
                        { key: 'bloqueos', label: 'Bloqueos/infiltración' },
                        { key: 'acupuntura', label: 'Acupuntura' },
                        { key: 'ozonoterapia', label: 'Ozonoterapia' },
                      ].map((treatment) => {
                        const treatmentData = formData.treatmentsReceived?.[treatment.key as keyof typeof formData.treatmentsReceived];
                        return (
                          <div key={treatment.key} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                              <Label className="text-sm font-semibold">{treatment.label}:</Label>
                              <RadioGroup
                                value={treatmentData?.received === true ? 'si' : treatmentData?.received === false ? 'no' : undefined}
                                onValueChange={(value) => {
                                  const updated = {
                                    ...formData.treatmentsReceived,
                                    [treatment.key]: { received: value === 'si', details: treatmentData?.details || '' }
                                  };
                                  handleInputChange('treatmentsReceived', updated);
                                }}
                                className="flex gap-3 ml-auto"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="si" id={`${treatment.key}-si`} />
                                  <Label htmlFor={`${treatment.key}-si`} className="text-xs">SI</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id={`${treatment.key}-no`} />
                                  <Label htmlFor={`${treatment.key}-no`} className="text-xs">NO</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            {treatmentData?.received && (
                              <Input
                                value={treatmentData.details || ''}
                                onChange={(e) => {
                                  const updated = {
                                    ...formData.treatmentsReceived,
                                    [treatment.key]: { received: true, details: e.target.value }
                                  };
                                  handleInputChange('treatmentsReceived', updated);
                                }}
                                className="mt-2"
                                placeholder="Cuándo y cuántas veces..."
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="treatmentsOther" className="text-sm text-gray-600">Otros:</Label>
                      <Input
                        id="treatmentsOther"
                        value={formData.treatmentsReceived?.otros || ''}
                        onChange={(e) => {
                          const updated = { ...formData.treatmentsReceived, otros: e.target.value };
                          handleInputChange('treatmentsReceived', updated);
                        }}
                        className="mt-1"
                        placeholder="Especifique otros tratamientos..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      16) Le han hecho algunas de las siguientes pruebas (si es Sí, cuándo):
                    </Label>
                    <div className="space-y-3">
                      {[
                        { key: 'rayosX', label: 'Rayos X' },
                        { key: 'tomografia', label: 'Tomografía' },
                        { key: 'resonancia', label: 'Resonancia magnética' },
                        { key: 'gamagrafia', label: 'Gamagrafía Ósea' },
                        { key: 'electromiografia', label: 'Electromiografía' },
                      ].map((test) => {
                        const testData = formData.testsPerformed?.[test.key as keyof typeof formData.testsPerformed];
                        return (
                          <div key={test.key} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                              <Label className="text-sm font-semibold">{test.label}:</Label>
                              <RadioGroup
                                value={testData?.performed === true ? 'si' : testData?.performed === false ? 'no' : undefined}
                                onValueChange={(value) => {
                                  const updated = {
                                    ...formData.testsPerformed,
                                    [test.key]: { performed: value === 'si', when: testData?.when || '' }
                                  };
                                  handleInputChange('testsPerformed', updated);
                                }}
                                className="flex gap-3 ml-auto"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="si" id={`${test.key}-si`} />
                                  <Label htmlFor={`${test.key}-si`} className="text-xs">SI</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="no" id={`${test.key}-no`} />
                                  <Label htmlFor={`${test.key}-no`} className="text-xs">NO</Label>
                                </div>
                              </RadioGroup>
                            </div>
                            {testData?.performed && (
                              <Input
                                value={testData.when || ''}
                                onChange={(e) => {
                                  const updated = {
                                    ...formData.testsPerformed,
                                    [test.key]: { performed: true, when: e.target.value }
                                  };
                                  handleInputChange('testsPerformed', updated);
                                }}
                                className="mt-2"
                                placeholder="Cuándo..."
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="testsOther" className="text-sm text-gray-600">Otros análisis:</Label>
                      <Input
                        id="testsOther"
                        value={formData.testsPerformed?.otros || ''}
                        onChange={(e) => {
                          const updated = { ...formData.testsPerformed, otros: e.target.value };
                          handleInputChange('testsPerformed', updated);
                        }}
                        className="mt-1"
                        placeholder="Especifique otros análisis..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="medications" className="text-base font-semibold text-gray-700">
                        17) Qué medicamentos toma para su dolor:
                      </Label>
                      <Textarea
                        id="medications"
                        value={formData.medications || ''}
                        onChange={(e) => handleInputChange('medications', e.target.value)}
                        className="mt-2"
                        rows={3}
                        placeholder="Liste los medicamentos..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicationsHelp" className="text-sm text-gray-600">
                        Cuál de ellos le mejora:
                      </Label>
                      <Input
                        id="medicationsHelp"
                        value={formData.medicationsHelp || ''}
                        onChange={(e) => handleInputChange('medicationsHelp', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="medicationsNoHelp" className="text-sm text-gray-600">
                        Cuál de ellos no le ayuda:
                      </Label>
                      <Input
                        id="medicationsNoHelp"
                        value={formData.medicationsNoHelp || ''}
                        onChange={(e) => handleInputChange('medicationsNoHelp', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="otherMedications" className="text-sm text-gray-600">
                        Toma medicamentos para alguna otra dolencia:
                      </Label>
                      <Input
                        id="otherMedications"
                        value={formData.otherMedications || ''}
                        onChange={(e) => handleInputChange('otherMedications', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="anticoagulants" className="text-sm text-gray-600">
                        Toma anticoagulante:
                      </Label>
                      <Input
                        id="anticoagulants"
                        value={formData.anticoagulants || ''}
                        onChange={(e) => handleInputChange('anticoagulants', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="contrastAllergy" className="text-sm text-gray-600">
                        Alergia a sustancias de contraste yodado:
                      </Label>
                      <Input
                        id="contrastAllergy"
                        value={formData.contrastAllergy || ''}
                        onChange={(e) => handleInputChange('contrastAllergy', e.target.value)}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 4: Estilo de Vida y Consulta */}
                <TabsContent value="lifestyle" className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Usted Fuma:
                    </Label>
                    <div className="space-y-3">
                      <RadioGroup
                        value={formData.smoking?.smokes === true ? 'si' : formData.smoking?.smokes === false ? 'no' : undefined}
                        onValueChange={(value) => {
                          handleInputChange('smoking', {
                            ...formData.smoking,
                            smokes: value === 'si'
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="smoke-si" />
                          <Label htmlFor="smoke-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="smoke-no" />
                          <Label htmlFor="smoke-no">NO</Label>
                        </div>
                      </RadioGroup>
                      {formData.smoking?.smokes && (
                        <>
                          <div>
                            <Label htmlFor="smokingFrequency" className="text-sm text-gray-600">Frecuencia:</Label>
                            <Input
                              id="smokingFrequency"
                              value={formData.smoking?.frequency || ''}
                              onChange={(e) => {
                                handleInputChange('smoking', {
                                  ...formData.smoking,
                                  frequency: e.target.value
                                });
                              }}
                              className="mt-1"
                              placeholder="Especifique frecuencia..."
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600 mb-2 block">Fumar le ayuda con el dolor:</Label>
                            <RadioGroup
                              value={formData.smoking?.helpsPain === true ? 'si' : formData.smoking?.helpsPain === false ? 'no' : undefined}
                              onValueChange={(value) => {
                                handleInputChange('smoking', {
                                  ...formData.smoking,
                                  helpsPain: value === 'si'
                                });
                              }}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="si" id="smoke-help-si" />
                                <Label htmlFor="smoke-help-si">SI</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="smoke-help-no" />
                                <Label htmlFor="smoke-help-no">NO</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Ud. toma alcohol:
                    </Label>
                    <div className="space-y-3">
                      <RadioGroup
                        value={formData.alcohol?.drinks === true ? 'si' : formData.alcohol?.drinks === false ? 'no' : undefined}
                        onValueChange={(value) => {
                          handleInputChange('alcohol', {
                            ...formData.alcohol,
                            drinks: value === 'si'
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="alcohol-si" />
                          <Label htmlFor="alcohol-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="alcohol-no" />
                          <Label htmlFor="alcohol-no">NO</Label>
                        </div>
                      </RadioGroup>
                      {formData.alcohol?.drinks && (
                        <>
                          <div>
                            <Label htmlFor="alcoholFrequency" className="text-sm text-gray-600">Frecuencia:</Label>
                            <Input
                              id="alcoholFrequency"
                              value={formData.alcohol?.frequency || ''}
                              onChange={(e) => {
                                handleInputChange('alcohol', {
                                  ...formData.alcohol,
                                  frequency: e.target.value
                                });
                              }}
                              className="mt-1"
                              placeholder="Especifique frecuencia..."
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600 mb-2 block">El Alcohol le ayuda con su dolor:</Label>
                            <RadioGroup
                              value={formData.alcohol?.helpsPain === true ? 'si' : formData.alcohol?.helpsPain === false ? 'no' : undefined}
                              onValueChange={(value) => {
                                handleInputChange('alcohol', {
                                  ...formData.alcohol,
                                  helpsPain: value === 'si'
                                });
                              }}
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="si" id="alcohol-help-si" />
                                <Label htmlFor="alcohol-help-si">SI</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="alcohol-help-no" />
                                <Label htmlFor="alcohol-help-no">NO</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Ud. ha consumido:
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Marihuana', 'Cocaína', 'Mastica coca'].map((drug) => {
                        const key = drug.toLowerCase().replace(' ', '') as 'marihuana' | 'cocaina' | 'masticacoca';
                        const drugKey = key === 'masticacoca' ? 'masticaCoca' : key === 'cocaina' ? 'cocaina' : 'marihuana';
                        return (
                          <label key={drug} className="flex items-center space-x-2 cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <Checkbox
                              checked={formData.drugs?.[drugKey as keyof typeof formData.drugs] || false}
                              onCheckedChange={(checked) => {
                                const updated = {
                                  ...formData.drugs,
                                  [drugKey]: checked === true
                                };
                                handleInputChange('drugs', updated);
                              }}
                            />
                            <span className="text-sm">{drug}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <Label htmlFor="drugsOther" className="text-sm text-gray-600">Alguna droga:</Label>
                      <Input
                        id="drugsOther"
                        value={formData.drugs?.otros || ''}
                        onChange={(e) => {
                          const updated = { ...formData.drugs, otros: e.target.value };
                          handleInputChange('drugs', updated);
                        }}
                        className="mt-1"
                        placeholder="Especifique..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base font-semibold text-gray-700 mb-3 block">
                      Ha tenido alguna vez tratamiento: psicológico psiquiátrico
                    </Label>
                    <div className="space-y-3">
                      <RadioGroup
                        value={formData.psychologicalTreatment?.received === true ? 'si' : formData.psychologicalTreatment?.received === false ? 'no' : undefined}
                        onValueChange={(value) => {
                          handleInputChange('psychologicalTreatment', {
                            ...formData.psychologicalTreatment,
                            received: value === 'si'
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id="psych-si" />
                          <Label htmlFor="psych-si">SI</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="psych-no" />
                          <Label htmlFor="psych-no">NO</Label>
                        </div>
                      </RadioGroup>
                      {formData.psychologicalTreatment?.received && (
                        <div>
                          <Label htmlFor="psychMedication" className="text-sm text-gray-600">
                            Si es SI qué medicamento toma:
                          </Label>
                          <Textarea
                            id="psychMedication"
                            value={formData.psychologicalTreatment?.medication || ''}
                            onChange={(e) => {
                              handleInputChange('psychologicalTreatment', {
                                ...formData.psychologicalTreatment,
                                medication: e.target.value
                              });
                            }}
                            className="mt-1"
                            rows={3}
                            placeholder="Especifique medicamentos..."
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label htmlFor="consultationReason" className="text-base font-semibold text-gray-700">
                        MOTIVO DE CONSULTA:
                      </Label>
                      <Input
                        id="consultationReason"
                        value={formData.consultationReason || ''}
                        onChange={(e) => handleInputChange('consultationReason', e.target.value)}
                        className="mt-2"
                        placeholder="Especifique el motivo de consulta..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="illnessDuration" className="text-base font-semibold text-gray-700">
                        TIEMPO DE ENFERMEDAD:
                      </Label>
                      <Input
                        id="illnessDuration"
                        value={formData.illnessDuration || ''}
                        onChange={(e) => handleInputChange('illnessDuration', e.target.value)}
                        className="mt-2"
                        placeholder="Especifique el tiempo de enfermedad..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentEpisode" className="text-base font-semibold text-gray-700">
                        EPISODIO ACTUAL:
                      </Label>
                      <Input
                        id="currentEpisode"
                        value={formData.currentEpisode || ''}
                        onChange={(e) => handleInputChange('currentEpisode', e.target.value)}
                        className="mt-2"
                        placeholder="Describa el episodio actual..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="narrative" className="text-base font-semibold text-gray-700">
                        RELATO:
                      </Label>
                      <Textarea
                        id="narrative"
                        value={formData.narrative || ''}
                        onChange={(e) => handleInputChange('narrative', e.target.value)}
                        className="mt-2"
                        rows={8}
                        placeholder="Relato detallado del paciente..."
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sección de Patología Concluyente (aparece después de guardar el dolor) */}
            {painSaved && (
              <div className="border-t pt-6 mt-6 bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Patología Concluyente</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Después de registrar el dolor, puede agregar la patología concluyente que aparecerá en la ficha clínica del paciente.
                </p>
                <div>
                  <Label htmlFor="conclusivePathology" className="text-lg font-semibold text-gray-700">
                    Patología concluyente:
                  </Label>
                  <Input
                    id="conclusivePathology"
                    value={conclusivePathology}
                    onChange={(e) => setConclusivePathology(e.target.value)}
                    className="mt-2 h-12 text-lg"
                    placeholder="Ej: Dolor lumbar crónico, Artritis reumatoide, etc."
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    onClick={handleSaveConclusivePathology}
                    variant="outline"
                    className="h-12 text-lg font-bold px-6"
                  >
                    Omitir
                  </Button>
                  <Button
                    onClick={handleSaveConclusivePathology}
                    className="h-12 text-lg font-bold bg-green-600 hover:bg-green-700 px-6"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Guardar Patología
                  </Button>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            {!painSaved && (
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  onClick={onCancel}
                  variant="outline"
                  className="h-16 text-xl font-bold px-8"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="h-16 text-xl font-bold bg-green-600 hover:bg-green-700 px-8"
                >
                  <Save className="w-6 h-6 mr-2" />
                  Guardar Nuevo Dolor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
