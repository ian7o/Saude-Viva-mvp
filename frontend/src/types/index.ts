export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Patient {
  id: number;
  name: string;
  birthDate: string;
  identificationNumber: string;
  phone?: string;
  email?: string;
}

export interface Appointment {
  id: number;
  description: string;
  specialty: string;
  date: string;
  status?: string;
  editedBy?: number;
  editedAt?: string;
  doctorId: number;
  patientId: number;
  patient?: Patient;
  doctor?: User;
}

export interface ClinicalDocument {
  id: number;
  filename: string;
  originalName: string;
  mimetype: string;
  description?: string;
  room?: string;
  location?: string;
  uploadDate: string;
  patientId?: number;
  doctorId?: number;
  appointmentId?: number;
  patient?: Patient;
}