export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PainLocation =
  | "Cabeza"
  | "Espalda"
  | "Rodillas"
  | "Pecho"
  | "Estómago"
  | "Brazos"
  | "Piernas"
  | "Otro"
  // Ubicaciones específicas para el mapa de calor
  | "pecho"
  | "espalda alta"
  | "espalda baja"
  | "cadera"
  | "hombro izquierdo"
  | "hombro derecho"
  | "biceps izquierdo"
  | "biceps derecho"
  | "antebrazo izquierdo"
  | "antebrazo derecho"
  | "muñeca izquierda"
  | "muñeca derecha"
  | "palma izquierda"
  | "palma derecha"
  | "codo izquierdo"
  | "codo derecho"
  | "rodilla izquierda"
  | "rodilla derecha"
  | "tobillo izquierdo"
  | "tobillo derecho"
  | "talon izquierdo"
  | "talon derecho"
  | "planta izquierda"
  | "planta derecha"
  | "empeine izquierdo"
  | "empeine derecho"
  | "muslo posterior izquierdo"
  | "muslo posterior derecho"
  | "dorso izquierdo"
  | "dorso derecho";

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
}

export interface Doctor {
  code: string;
  password: string;
  name: string;
}
