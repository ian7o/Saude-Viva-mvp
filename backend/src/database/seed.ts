import { DataSource, Repository } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Doctor } from "src/entities/doctor.entity";
import { Patient } from "src/entities/patient.entity";
import { Appointment } from "src/entities/appointment.entity";
import { ClinicalDocument } from "src/entities/clinical-document.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/users/entities/user.entity";

const DOCTORS = [
  { name: "Dr. gui", email: "admin@saudeviva.com", specialty: "General Medicine", age: 35, sex: "male" },
  { name: "Dr. nair", email: "admin@saudevivax.com", specialty: "General Medicinez", age: 35, sex: "male" },
];

const PATIENTS = [
  { name: "João Silva", birthDate: new Date("1985-06-15"), identificationNumber: "12345678", phone: "+351912345678", email: "joao.silva@example.com", sex: "male" as const },
  { name: "Maria Santos", birthDate: new Date("1990-03-22"), identificationNumber: "87654321", phone: "+351987654321", email: "maria.santos@example.com", sex: "female" as const },
  {
    name: "Pedro Almeida",
    birthDate: new Date("1978-11-08"),
    identificationNumber: "11223344",
    phone: "+351933444555",
    email: "pedro.almeida@example.com",
    sex: "male" as const,
  },
  { name: "Sofia Costa", birthDate: new Date("1995-05-20"), identificationNumber: "55667788", phone: "+351944555666", email: "sofia.costa@example.com", sex: "female" as const },
  { name: "Miguel Rodrigues", birthDate: new Date("1982-08-14"), identificationNumber: "99887766", phone: "+351955666777", email: "miguel.rodrigues@example.com", sex: "male" as const },
];

const APPOINTMENTS_DATA = [
  { description: "Check-up anual", specialty: "Medicina Geral", daysFromToday: 0, hour: 9, minute: 0, patientIndex: 0 },
  { description: "Seguimento de análises", specialty: "Laboratório", daysFromToday: 0, hour: 10, minute: 30, patientIndex: 1 },
  { description: "Consulta de cardiologia", specialty: "Cardiologia", daysFromToday: 1, hour: 14, minute: 0, patientIndex: 0 },
  { description: "Consulta de rotina", specialty: "Medicina Geral", daysFromToday: 0, hour: 9, minute: 0, patientIndex: 2 },
  { description: "Revisão de tensão arterial", specialty: "Cardiologia", daysFromToday: 1, hour: 10, minute: 0, patientIndex: 3 },
  { description: "Vacinação", specialty: "Medicina Geral", daysFromToday: 2, hour: 11, minute: 0, patientIndex: 4 },
  { description: "Revisão de resultados laboratoriais", specialty: "Laboratório", daysFromToday: 3, hour: 14, minute: 0, patientIndex: 0 },
  { description: "Consulta de medicina dentária", specialty: "Medicina Dentária", daysFromToday: 4, hour: 9, minute: 30, patientIndex: 1 },
  { description: "Consulta de urgência", specialty: "Medicina Geral", daysFromToday: 5, hour: 10, minute: 0, patientIndex: 2 },
  { description: "Consulta de seguimento", specialty: "Medicina Geral", daysFromToday: 6, hour: 11, minute: 0, patientIndex: 3 },
];

type MessageSeed = {
  content: string;
  senderType: "patient" | "professional";
  receiverType: "patient" | "professional";
  senderPatientIndex?: number;
  senderDoctorIndex?: number;
  receiverPatientIndex?: number;
  receiverDoctorIndex?: number;
};

const MESSAGES_DATA: MessageSeed[] = [
  { content: "Olá Dr., gostaria de saber os resultados das análises.", senderType: "patient", senderPatientIndex: 0, receiverType: "professional", receiverDoctorIndex: 0 },
  { content: "Olá João, os resultados estão prontos. Pode passar amanhã às 10h.", senderType: "professional", senderDoctorIndex: 0, receiverType: "patient", receiverPatientIndex: 0 },
  { content: "Dr., preciso remarcar a consulta de amanhã.", senderType: "patient", senderPatientIndex: 1, receiverType: "professional", receiverDoctorIndex: 0 },
  { content: "Bom dia Dr. Administrador! Tem disponíveis algum horário para reunião esta semana?", senderType: "professional", senderDoctorIndex: 1, receiverType: "professional", receiverDoctorIndex: 0 },
  { content: "Olá Dr. Gui, amanhã às 14h está disponível na minha sala.", senderType: "professional", senderDoctorIndex: 0, receiverType: "professional", receiverDoctorIndex: 1 },
];

function getDayDate(daysFromToday: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seedUsers(
  userRepo: Repository<User>,
  hashedPassword: string,
): Promise<void> {
  const users = [
    { email: "admin@saudeviva.com", name: "Dr. gui", age: 35, sex: "male" },
    { email: "admin@saudevivax.com", name: "Dr. nair", age: 35, sex: "male" },
    { email: "secretaria@saudeviva.com", name: "Maria Secretária", age: 28, sex: "female", role: "secretary" },
  ];

  for (const u of users) {
    await findOrCreateUser(userRepo, { ...u, password: hashedPassword });
  }
}

async function seedDoctors(doctorRepo: Repository<Doctor>, hashedPassword: string): Promise<Doctor[]> {
  const doctors: Doctor[] = [];

  for (const d of DOCTORS) {
    let doctor = await doctorRepo.findOne({ where: { email: d.email } });
    if (!doctor) {
      doctor = doctorRepo.create({
        name: d.name,
        email: d.email,
        password: hashedPassword,
        specialty: d.specialty,
      });
      doctor = await doctorRepo.save(doctor);
    }
    doctors.push(doctor);
  }

  return doctors;
}

async function seedPatients(
  patientRepo: Repository<Patient>,
  userRepo: Repository<User>,
  patientPasswordHash: string,
): Promise<Patient[]> {
  const patients: Patient[] = [];

  for (const p of PATIENTS) {
    let patient = await patientRepo.findOne({ where: { email: p.email } });
    if (!patient) {
      patient = patientRepo.create({
        name: p.name,
        birthDate: p.birthDate,
        identificationNumber: p.identificationNumber,
        phone: p.phone,
        email: p.email,
      });
      patient = await patientRepo.save(patient);
    }

    let user = await userRepo.findOne({ where: { email: p.email } });
    if (!user) {
      user = userRepo.create({
        email: p.email,
        name: p.name,
        password: patientPasswordHash,
        age: 0,
        sex: p.sex,
        role: "patient",
        patientId: patient.id,
      });
      await userRepo.save(user);
    }

    patients.push(patient);
  }

  return patients;
}

async function seedAppointments(
  appointmentRepo: Repository<Appointment>,
  doctor: Doctor,
  patients: Patient[],
): Promise<Appointment[]> {
  const appointments: Appointment[] = [];

  for (const a of APPOINTMENTS_DATA) {
    const appointment = appointmentRepo.create({
      description: a.description,
      specialty: a.specialty,
      date: getDayDate(a.daysFromToday, a.hour, a.minute),
      doctorId: doctor.id,
      patientId: patients[a.patientIndex].id,
    });
    appointments.push(await appointmentRepo.save(appointment));
  }

  return appointments;
}

async function seedDocument(
  documentRepo: Repository<ClinicalDocument>,
  patient: Patient,
  doctor: Doctor,
  appointment: Appointment,
): Promise<void> {
  const existing = await documentRepo.findOne({ where: { patientId: patient.id } });
  if (!existing) {
    const document = documentRepo.create({
      filename: "relatorio-medico.pdf",
      originalName: "relatorio-medico.pdf",
      mimetype: "application/pdf",
      description: "Relatório médico anual",
      room: "Sala 101",
      location: "Lisboa",
      patientId: patient.id,
      doctorId: doctor.id,
      appointmentId: appointment.id,
    });
    await documentRepo.save(document);
  }
}

async function seedMessages(
  messageRepo: Repository<Message>,
  patients: Patient[],
  doctors: Doctor[],
): Promise<void> {
  for (const m of MESSAGES_DATA) {
    let senderId: number;
    let senderName: string;
    if (m.senderType === "patient") {
      senderId = patients[m.senderPatientIndex!].id;
      senderName = patients[m.senderPatientIndex!].name;
    } else {
      senderId = doctors[m.senderDoctorIndex!].id;
      senderName = doctors[m.senderDoctorIndex!].name;
    }

    let receiverId: number;
    if (m.receiverType === "patient") {
      receiverId = patients[m.receiverPatientIndex!].id;
    } else {
      receiverId = doctors[m.receiverDoctorIndex!].id;
    }

    const message = messageRepo.create({
      content: m.content,
      senderId,
      senderName,
      senderType: m.senderType,
      receiverId,
      receiverType: m.receiverType,
    });
    await messageRepo.save(message);
  }
}

async function findOrCreateUser(
  userRepo: Repository<User>,
  data: {
    email: string;
    name: string;
    password: string;
    age: number;
    sex: string;
    role?: string;
  },
): Promise<User> {
  let user = await userRepo.findOne({ where: { email: data.email } });
  if (!user) {
    user = userRepo.create(data);
    user = await userRepo.save(user);
  }
  return user;
}

export async function seed(dataSource: DataSource) {
  const doctorRepo = dataSource.getRepository(Doctor);
  const patientRepo = dataSource.getRepository(Patient);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const documentRepo = dataSource.getRepository(ClinicalDocument);
  const messageRepo = dataSource.getRepository(Message);
  const userRepo = dataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const patientPasswordHash = await bcrypt.hash("paciente123", 10);

  await seedUsers(userRepo, hashedPassword);
  const doctors = await seedDoctors(doctorRepo, hashedPassword);
  const patients = await seedPatients(patientRepo, userRepo, patientPasswordHash);
  const appointments = await seedAppointments(appointmentRepo, doctors[0], patients);
  await seedDocument(documentRepo, patients[0], doctors[0], appointments[0]);
  await seedMessages(messageRepo, patients, doctors);

  console.log("Seed completed successfully!");
}
