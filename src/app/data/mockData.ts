import { Patient, Doctor, PainRecord, Medication, MedicationRecord, InterventionalTreatment } from "@/app/types";

export const mockDoctors: Doctor[] = [
  {
    code: "MED001",
    password: "1234",
    name: "Dr. García",
  },
];

export const mockPatients: Patient[] = [
  {
    dni: "12345678",
    name: "María González",
    password: "1234",
    age: 72,
    gender: "Mujer",
    originPlace: "Cusco",
    nativeLanguage: ["Quechua", "Español"],
    weight: 58,
    height: 1.55,
    pathology: ["Dolor osteoarticular crónico", "Dolor lumbar crónico"],
    dependency: ["Moderada"],
    treatment: [
      "Analgésicos no opioides",
      "Fisioterapia para dolor crónico",
      "Ejercicios de movilidad asistida",
    ],
    nextAppointment: new Date(2026, 1, 12), // 12 de febrero de 2026
    status: "warning",
    needsAppointment: false,
    caracter: "Agresivo",
    numberOfChildren: "3",
    educationLevel: "Secundaria completa",
    occupation: "Comerciante",
    doctorDiagnosis: "Dolor osteoarticular crónico en la rodilla y lumbar. En tratamiento con analgesia y fisioterapia.",
    treatedBodyParts: ["Rodillas", "Espalda"], // Partes tratadas en consulta
    medications: [
      { id: "med1", name: "Paracetamol", dosage: "500 mg", active: true },
      { id: "med2", name: "Naproxeno", dosage: "500 mg", active: true },
    ],
  },
  {
    dni: "87654321",
    name: "Juan Pérez",
    password: "1234",
    age: 80,
    gender: "Hombre",
    originPlace: "Arequipa",
    nativeLanguage: ["Español"],
    weight: 70,
    height: 1.68,
    pathology: ["Dolor musculoesquelético crónico", "Fibromialgia"],
    treatment: [
      "Terapia cognitivo-conductual para dolor crónico",
      "Educación en manejo del dolor",
      "Actividad física supervisada",
    ],
    dependency: ["Severa"],
    nextAppointment: new Date(2026, 0, 28),
    status: "critical",
    needsAppointment: true,
    caracter: "Impaciente",
    numberOfChildren: "2",
    educationLevel: "Primaria completa",
    occupation: "Agricultor",
    doctorDiagnosis: "Dolor musculoesquelético crónico, fibromialgia. Terapia y actividad física supervisada.",
    treatedBodyParts: ["Espalda", "Piernas"], // Partes tratadas en consulta
    medications: [
      { id: "med3", name: "Ibuprofeno", dosage: "400 mg", active: true },
    ],
  },
  {
    dni: "11223344",
    name: "Ana Martínez",
    password: "1234",
    age: 67,
    gender: "Mujer",
    originPlace: "Lima",
    nativeLanguage: ["Español"],
    weight: 62,
    height: 1.6,
    pathology: ["Dolor musculoesquelético crónico", "Fibromialgia"],
    treatment: [
      "Terapia cognitivo-conductual para dolor crónico",
      "Educación en manejo del dolor",
      "Actividad física supervisada",
    ],
    status: "stable",
    needsAppointment: false,
    numberOfChildren: "4",
    educationLevel: "Superior incompleta",
    occupation: "Ama de casa",
    doctorDiagnosis: "Dolor musculoesquelético crónico, fibromialgia.",
    treatedBodyParts: ["Cabeza", "Pecho"], // Partes tratadas en consulta
    medications: [
      { id: "med4", name: "Paracetamol", dosage: "500 mg", active: true },
    ],
  },
];

// María González: evolución ascendente hasta patrón crítico (mockup para demo)
export const mockPainRecords: PainRecord[] = [
  { id: "1", patientDNI: "12345678", date: new Date(2026, 0, 22), painLevel: 2, location: "Rodillas", type: "Sordo", painClassification: "Somático" },
  { id: "2", patientDNI: "12345678", date: new Date(2026, 0, 26), painLevel: 3, location: "Rodillas", type: "Sordo", painClassification: "Somático" },
  { id: "3", patientDNI: "12345678", date: new Date(2026, 1, 1), painLevel: 4, location: "Espalda", type: "Punzante", painClassification: "Neuropático" },
  { id: "4", patientDNI: "12345678", date: new Date(2026, 1, 5), painLevel: 5, location: "Espalda", type: "Punzante", painClassification: "Neuropático" },
  { id: "5", patientDNI: "12345678", date: new Date(2026, 1, 10), painLevel: 6, location: "Rodillas", type: "Punzante", painClassification: "Mixto" },
  { id: "6", patientDNI: "12345678", date: new Date(2026, 1, 14), painLevel: 8, location: "Espalda", type: "Quemante", painClassification: "Neuropático" },
  { id: "7", patientDNI: "12345678", date: new Date(2026, 1, 17), painLevel: 10, location: "Espalda", type: "Quemante", painClassification: "Mixto" },
  // Registros para Juan Pérez - mostrando aumento crítico
  {
    id: "8",
    patientDNI: "87654321",
    date: new Date(2026, 0, 25),
    painLevel: 4,
    location: "Espalda",
    type: "Molesto",
    painClassification: "Somático",
  },
  {
    id: "9",
    patientDNI: "87654321",
    date: new Date(2026, 0, 30),
    painLevel: 5,
    location: "Espalda",
    type: "Constante",
    painClassification: "Somático",
  },
  {
    id: "10",
    patientDNI: "87654321",
    date: new Date(2026, 1, 4),
    painLevel: 6,
    location: "Espalda",
    type: "Punzante",
    painClassification: "Neuropático",
  },
  {
    id: "11",
    patientDNI: "87654321",
    date: new Date(2026, 1, 9),
    painLevel: 7,
    location: "Espalda",
    type: "Fuerte",
    painClassification: "Mixto",
  },
  {
    id: "12",
    patientDNI: "87654321",
    date: new Date(2026, 1, 13),
    painLevel: 9,
    location: "Espalda",
    type: "Ardor",
    painClassification: "Neuropático",
  },
  {
    id: "13",
    patientDNI: "87654321",
    date: new Date(2026, 1, 16),
    painLevel: 8,
    location: "Piernas",
    type: "Intermitente",
    painClassification: "Visceral",
  },
  // Registros para Ana Martínez - paciente estable
  {
    id: "14",
    patientDNI: "11223344",
    date: new Date(2026, 0, 24),
    painLevel: 2,
    location: "Cabeza",
    type: "Molesto",
    painClassification: "Somático",
  },
  {
    id: "15",
    patientDNI: "11223344",
    date: new Date(2026, 1, 2),
    painLevel: 1,
    location: "Cabeza",
    type: "Molesto",
    painClassification: "Somático",
  },
  {
    id: "16",
    patientDNI: "11223344",
    date: new Date(2026, 1, 8),
    painLevel: 2,
    location: "Rodillas",
    type: "Molesto",
    painClassification: "Somático",
  },
  {
    id: "17",
    patientDNI: "11223344",
    date: new Date(2026, 1, 12),
    painLevel: 1,
    location: "Rodillas",
    type: "Molesto",
    painClassification: "Somático",
  },
  {
    id: "18",
    patientDNI: "11223344",
    date: new Date(2026, 1, 17),
    painLevel: 2,
    location: "Espalda",
    type: "Intermitente",
    painClassification: "Visceral",
  },
];

// Funciones helper para simular operaciones de base de datos
export const findPatientByDNI = (dni: string): Patient | undefined => {
  return mockPatients.find((p) => p.dni === dni);
};

/** Actualiza un paciente en la lista (p. ej. desde el perfil editable). */
export const updatePatient = (updated: Patient): void => {
  const i = mockPatients.findIndex((p) => p.dni === updated.dni);
  if (i !== -1) mockPatients[i] = updated;
};

export const findDoctorByCode = (code: string): Doctor | undefined => {
  return mockDoctors.find((d) => d.code === code);
};

export const getPatientRecords = (dni: string): PainRecord[] => {
  return mockPainRecords.filter((r) => r.patientDNI === dni);
};

export const addPainRecord = (record: Omit<PainRecord, "id">): PainRecord => {
  const newRecord = {
    ...record,
    id: `${mockPainRecords.length + 1}`,
  };
  mockPainRecords.push(newRecord);
  return newRecord;
};

// ═══════════════════════════════════════════════════════════════
// Registros de medicación mock (para gráfica del médico)
// ═══════════════════════════════════════════════════════════════
export const mockMedicationRecords: MedicationRecord[] = [
  // María González — med1: Paracetamol, med2: Naproxeno
  { medicationId: "med1", date: new Date(2026, 0, 22), taken: true },
  { medicationId: "med2", date: new Date(2026, 0, 22), taken: true },
  { medicationId: "med1", date: new Date(2026, 0, 26), taken: true },
  { medicationId: "med2", date: new Date(2026, 0, 26), taken: false, reasonNotTaken: "Me olvidé" },
  { medicationId: "med1", date: new Date(2026, 1, 1), taken: true },
  { medicationId: "med2", date: new Date(2026, 1, 1), taken: true },
  { medicationId: "med1", date: new Date(2026, 1, 5), taken: false, reasonNotTaken: "No lo tenía" },
  { medicationId: "med2", date: new Date(2026, 1, 5), taken: true },
  { medicationId: "med1", date: new Date(2026, 1, 10), taken: true },
  { medicationId: "med2", date: new Date(2026, 1, 10), taken: true },
  { medicationId: "med1", date: new Date(2026, 1, 14), taken: true },
  { medicationId: "med2", date: new Date(2026, 1, 14), taken: true },
  { medicationId: "med1", date: new Date(2026, 1, 17), taken: true },
  { medicationId: "med2", date: new Date(2026, 1, 17), taken: false, reasonNotTaken: "Me sentí mal" },
  // Juan Pérez — med3: Ibuprofeno
  { medicationId: "med3", date: new Date(2026, 0, 25), taken: true },
  { medicationId: "med3", date: new Date(2026, 0, 30), taken: true },
  { medicationId: "med3", date: new Date(2026, 1, 4), taken: false, reasonNotTaken: "Me olvidé" },
  { medicationId: "med3", date: new Date(2026, 1, 9), taken: true },
  { medicationId: "med3", date: new Date(2026, 1, 13), taken: true },
  { medicationId: "med3", date: new Date(2026, 1, 16), taken: false, reasonNotTaken: "No lo tenía" },
  // Ana Martínez — med4: Paracetamol
  { medicationId: "med4", date: new Date(2026, 0, 24), taken: true },
  { medicationId: "med4", date: new Date(2026, 1, 2), taken: true },
  { medicationId: "med4", date: new Date(2026, 1, 8), taken: false, reasonNotTaken: "Me sentí mal" },
  { medicationId: "med4", date: new Date(2026, 1, 12), taken: true },
  { medicationId: "med4", date: new Date(2026, 1, 17), taken: true },
];

/** Obtiene registros de medicación mock para un paciente (por IDs de medicamentos). */
export const getMedicationRecords = (medicationIds: string[]): MedicationRecord[] => {
  return mockMedicationRecords.filter((r) => medicationIds.includes(r.medicationId));
};

// ═══════════════════════════════════════════════════════════════
// Tratamientos intervencionistas mock
// ═══════════════════════════════════════════════════════════════
export const mockInterventionalTreatments: InterventionalTreatment[] = [
  // María González
  { id: "it1", patientDNI: "12345678", date: new Date(2026, 1, 1), procedure: "Bloqueo nervioso", notes: "Bloqueo facetario L4-L5" },
  { id: "it2", patientDNI: "12345678", date: new Date(2026, 1, 14), procedure: "Infiltración", notes: "Infiltración con corticoides en rodilla derecha" },
  // Juan Pérez
  { id: "it3", patientDNI: "87654321", date: new Date(2026, 1, 4), procedure: "Radiofrecuencia", notes: "Radiofrecuencia pulsada lumbar" },
  { id: "it4", patientDNI: "87654321", date: new Date(2026, 1, 13), procedure: "Bloqueo epidural" },
  // Ana Martínez
  { id: "it5", patientDNI: "11223344", date: new Date(2026, 1, 8), procedure: "Infiltración", notes: "Infiltración articular en rodilla izquierda" },
];

export const getInterventionalTreatments = (dni: string): InterventionalTreatment[] => {
  return mockInterventionalTreatments.filter((t) => t.patientDNI === dni);
};
