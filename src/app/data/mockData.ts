import { Patient, Doctor, PainRecord, Medication } from "@/app/types";

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
  { id: "1", patientDNI: "12345678", date: new Date(2026, 1, 3), painLevel: 2, location: "Rodillas", type: "Sordo" },
  { id: "2", patientDNI: "12345678", date: new Date(2026, 1, 4), painLevel: 3, location: "Rodillas", type: "Sordo" },
  { id: "3", patientDNI: "12345678", date: new Date(2026, 1, 5), painLevel: 4, location: "Espalda", type: "Punzante" },
  { id: "4", patientDNI: "12345678", date: new Date(2026, 1, 6), painLevel: 5, location: "Espalda", type: "Punzante" },
  { id: "5", patientDNI: "12345678", date: new Date(2026, 1, 7), painLevel: 6, location: "Rodillas", type: "Punzante" },
  { id: "6", patientDNI: "12345678", date: new Date(2026, 1, 8), painLevel: 8, location: "Espalda", type: "Quemante" },
  { id: "7", patientDNI: "12345678", date: new Date(2026, 1, 9), painLevel: 10, location: "Espalda", type: "Quemante" },
  // Registros para Juan Pérez - mostrando aumento crítico
  {
    id: "8",
    patientDNI: "87654321",
    date: new Date(2026, 0, 18),
    painLevel: 4,
    location: "Espalda",
    type: "Molesto",
  },
  {
    id: "9",
    patientDNI: "87654321",
    date: new Date(2026, 0, 19),
    painLevel: 5,
    location: "Espalda",
    type: "Constante",
  },
  {
    id: "10",
    patientDNI: "87654321",
    date: new Date(2026, 0, 20),
    painLevel: 6,
    location: "Espalda",
    type: "Punzante",
  },
  {
    id: "11",
    patientDNI: "87654321",
    date: new Date(2026, 0, 21),
    painLevel: 7,
    location: "Espalda",
    type: "Fuerte",
  },
  {
    id: "12",
    patientDNI: "87654321",
    date: new Date(2026, 0, 22),
    painLevel: 9,
    location: "Espalda",
    type: "Ardor",
  },
  {
    id: "13",
    patientDNI: "87654321",
    date: new Date(2026, 0, 23),
    painLevel: 8,
    location: "Piernas",
    type: "Intermitente",
  },
  // Registros para Ana Martínez - paciente estable
  {
    id: "14",
    patientDNI: "11223344",
    date: new Date(2026, 0, 19),
    painLevel: 2,
    location: "Cabeza",
    type: "Molesto",
  },
  {
    id: "15",
    patientDNI: "11223344",
    date: new Date(2026, 0, 20),
    painLevel: 1,
    location: "Cabeza",
    type: "Molesto",
  },
  {
    id: "16",
    patientDNI: "11223344",
    date: new Date(2026, 0, 21),
    painLevel: 2,
    location: "Rodillas",
    type: "Molesto",
  },
  {
    id: "17",
    patientDNI: "11223344",
    date: new Date(2026, 0, 22),
    painLevel: 1,
    location: "Rodillas",
    type: "Molesto",
  },
  {
    id: "18",
    patientDNI: "11223344",
    date: new Date(2026, 0, 23),
    painLevel: 2,
    location: "Espalda",
    type: "Intermitente",
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
