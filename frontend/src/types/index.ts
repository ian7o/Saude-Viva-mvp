export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  patientId?: number;
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
  clinicId?: number;
  patient?: Patient;
  doctor?: User;
  clinic?: Clinic;
}

export interface Clinic {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  doctors?: Doctor[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty?: string;
  clinicId?: number;
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
