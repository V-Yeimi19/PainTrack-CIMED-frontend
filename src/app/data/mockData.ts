import { Patient, Doctor, PainRecord } from "@/app/types";

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
    nextAppointment: new Date(2026, 0, 25),
    status: "warning",
    needsAppointment: false,
    caracter: "Agresivo",
  },
  {
    dni: "87654321",
    name: "Juan Pérez",
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
  },
  {
    dni: "11223344",
    name: "Ana Martínez",
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
  },
];

export const mockPainRecords: PainRecord[] = [
  {
    id: "1",
    patientDNI: "12345678",
    date: new Date(2026, 0, 15),
    painLevel: 3,
    location: "Rodillas",
    type: "Molesto",
  },
  {
    id: "2",
    patientDNI: "12345678",
    date: new Date(2026, 0, 16),
    painLevel: 4,
    location: "Rodillas",
    type: "Punzante",
  },
  {
    id: "3",
    patientDNI: "12345678",
    date: new Date(2026, 0, 17),
    painLevel: 2,
    location: "Rodillas",
    type: "Molesto",
  },
  {
    id: "4",
    patientDNI: "12345678",
    date: new Date(2026, 0, 18),
    painLevel: 5,
    location: "Espalda",
    type: "Constante",
  },
  {
    id: "5",
    patientDNI: "12345678",
    date: new Date(2026, 0, 19),
    painLevel: 3,
    location: "Espalda",
    type: "Molesto",
  },
  {
    id: "6",
    patientDNI: "12345678",
    date: new Date(2026, 0, 20),
    painLevel: 4,
    location: "Rodillas",
    type: "Punzante",
  },
  {
    id: "7",
    patientDNI: "12345678",
    date: new Date(2026, 0, 21),
    painLevel: 2,
    location: "Rodillas",
    type: "Molesto",
  },
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
