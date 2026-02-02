export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type PainLocation = 
  | 'Cabeza'
  | 'Espalda'
  | 'Rodillas'
  | 'Pecho'
  | 'Estómago'
  | 'Brazos'
  | 'Piernas'
  | 'Otro';

export type PainType = 
  | 'Ardor'
  | 'Punzante'
  | 'Fuerte'
  | 'Molesto'
  | 'Constante'
  | 'Intermitente';

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
  status?: 'stable' | 'warning' | 'critical'; // Semáforo clínico
  needsAppointment?: boolean; // Para notificaciones
}

export interface Doctor {
  code: string;
  password: string;
  name: string;
}