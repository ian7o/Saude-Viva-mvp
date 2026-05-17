import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Doctor } from "src/entities/doctor.entity";
import { Patient } from "src/entities/patient.entity";
import { Appointment } from "src/entities/appointment.entity";
import { ClinicalDocument } from "src/entities/clinical-document.entity";
import { User } from "src/users/entities/user.entity";

export async function seed(dataSource: DataSource) {
  const doctorRepo = dataSource.getRepository(Doctor);
  const patientRepo = dataSource.getRepository(Patient);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const documentRepo = dataSource.getRepository(ClinicalDocument);
  const userRepo = dataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  let user = await userRepo.findOne({
    where: { email: "admin@saudeviva.com" },
  });
  if (!user) {
    user = userRepo.create({
      email: "admin@saudeviva.com",
      name: "Dr. Admin",
      password: hashedPassword,
      age: 35,
      sex: "male",
    });
    await userRepo.save(user);
  }

  let user2 = await userRepo.findOne({
    where: { email: "admin@saudevivax.com" },
  });
  if (!user2) {
    user2 = userRepo.create({
      email: "admin@saudevivax.com",
      name: "Dr. gui",
      password: hashedPassword,
      age: 35,
      sex: "male",
    });
    await userRepo.save(user2);
  }

  let doctor = await doctorRepo.findOne({
    where: { email: "admin@saudeviva.com" },
  });
  if (!doctor) {
    doctor = doctorRepo.create({
      name: "Dr. Admin",
      email: "admin@saudeviva.com",
      password: hashedPassword,
      specialty: "General Medicine",
    });
    await doctorRepo.save(doctor);
  }

  let doctor2 = await doctorRepo.findOne({
    where: { email: "admin@saudevivax.com" },
  });
  if (!doctor2) {
    doctor2 = doctorRepo.create({
      name: "Dr. gui",
      email: "admin@saudevivax.com",
      password: hashedPassword,
      specialty: "General Medicinez",
    });
    await doctorRepo.save(doctor2);
  }

  const patient1 = patientRepo.create({
    name: "John Doe",
    birthDate: new Date("1985-06-15"),
    identificationNumber: "12345678",
    phone: "+351912345678",
    email: "john.doe@example.com",
  });
  await patientRepo.save(patient1);

  const patient2 = patientRepo.create({
    name: "Jane Smith",
    birthDate: new Date("1990-03-22"),
    identificationNumber: "87654321",
    phone: "+351987654321",
    email: "jane.smith@example.com",
  });
  await patientRepo.save(patient2);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment1 = appointmentRepo.create({
    description: "Annual checkup",
    specialty: "General Medicine",
    date: new Date(today.setHours(9, 0, 0, 0)),
    doctorId: doctor.id,
    patientId: patient1.id,
  });
  await appointmentRepo.save(appointment1);

  const appointment2 = appointmentRepo.create({
    description: "Blood test follow-up",
    specialty: "Laboratory",
    date: new Date(today.setHours(10, 30, 0, 0)),
    doctorId: doctor.id,
    patientId: patient2.id,
  });
  await appointmentRepo.save(appointment2);

  const appointment3 = appointmentRepo.create({
    description: "Cardiology consultation",
    specialty: "Cardiology",
    date: new Date(tomorrow.setHours(14, 0, 0, 0)),
    doctorId: doctor.id,
    patientId: patient1.id,
  });
  await appointmentRepo.save(appointment3);

  const document = documentRepo.create({
    filename: "sample-report.pdf",
    originalName: "medical-report.pdf",
    mimetype: "application/pdf",
    description: "Annual medical report",
    room: "Room 101",
    location: "Lisbon",
    patientId: patient1.id,
    doctorId: doctor.id,
    appointmentId: appointment1.id,
  });
  await documentRepo.save(document);

  console.log("Seed completed successfully!");
}
