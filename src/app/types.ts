export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PainLocation =
  | "Cabeza"
  | "Espalda"
  | "Rodillas"
  | "Pecho"
  | "Estómago"
  | "Brazos"
  | "Piernas"
  | "Otro";

export type PainType =
  | "Ardor"
  | "Punzante"
  | "Fuerte"
  | "Molesto"
  | "Constante"
  | "Intermitente";

export interface PainRecord {
  id: string;
  patientDNI: string;
  date: Date;
  painLevel: PainLevel;
  location: PainLocation;
  type: PainType;
}

export interface Patient {
  dni: string;
  name: string;
  nextAppointment?: Date;
  status?: "estable" | "advertencia" | "crítico"; // Semáforo clínico
  needsAppointment?: boolean; // Para notificaciones
  age: number;
  gender: "Hombre" | "Mujer" | "Otro";
  otherIllness?: string[];
  pathology?: string[];
  originPlace: string;
  nativeLanguage: string[];
  dependency?: string[];
  weight: number;
  height: number;
  treatment?: string[];
  caracter?: string;
}

export interface Doctor {
  code: string;
  password: string;
  name: string;
}
