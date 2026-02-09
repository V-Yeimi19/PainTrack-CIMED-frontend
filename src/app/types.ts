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
  | "Apretado"
  | "Punzante"
  | "Pulsátil"
  | "Corriente"
  | "Quemante"
  | "Ardor"
  | "Calambre"
  | "Cólico"
  | "Sordo"
  | "Tirante"
  | "Otro";

export interface PainRecord {
  id: string;
  patientDNI: string;
  date: Date;
  painLevel: PainLevel;
  location: PainLocation;
  type: PainType;
  painDuration?: string; // Por cuánto tiempo tiene este dolor
  painCause?: {
    lesion?: boolean;
    herida?: boolean;
    golpe?: boolean;
    noSabe?: boolean;
  };
}

export interface Patient {
  dni: string;
  name: string;
  password?: string; // Contraseña para el login
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
  numberOfChildren?: string;
  educationLevel?: string;
  occupation?: string;
  referringDoctor?: string;
  whoRecommended?: string;
  referralDataLastModified?: Date; // Fecha de última modificación de los datos de referencia
  conclusivePathology?: string[]; // Patologías concluyentes agregadas después de cada registro de dolor
  treatedBodyParts?: PainLocation[]; // Partes del cuerpo tratadas en consulta médica
  medications?: Medication[]; // Medicamentos activos indicados por el médico
}

export interface Medication {
  id: string;
  name: string;
  dosage: string; // Ej: "500 mg"
  active: boolean; // Si el medicamento está activo
}

export interface MedicationRecord {
  medicationId: string;
  date: Date;
  taken: boolean; // Si lo tomó hoy
  reasonNotTaken?: "Me olvidé" | "Me sentí mal" | "No lo tenía" | "Otro";
  otherReason?: string; // Si eligió "Otro"
}

export interface Doctor {
  code: string;
  password: string;
  name: string;
}
