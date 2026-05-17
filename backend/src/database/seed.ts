import { DataSource } from "typeorm";
import * as bcrypt from "bcryptjs";
import { Doctor } from "src/entities/doctor.entity";
import { Patient } from "src/entities/patient.entity";
import { Appointment } from "src/entities/appointment.entity";
import { ClinicalDocument } from "src/entities/clinical-document.entity";
import { Message } from "src/entities/message.entity";
import { User } from "src/users/entities/user.entity";

export async function seed(dataSource: DataSource) {
  const doctorRepo = dataSource.getRepository(Doctor);
  const patientRepo = dataSource.getRepository(Patient);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const documentRepo = dataSource.getRepository(ClinicalDocument);
  const messageRepo = dataSource.getRepository(Message);
  const userRepo = dataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  let user = await userRepo.findOne({
    where: { email: "admin@saudeviva.com" },
  });
  if (!user) {
    user = userRepo.create({
      email: "admin@saudeviva.com",
      name: "Dr. gui",
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
      name: "Dr. nair",
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
      name: "Dr. gui",
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
      name: "Dr. nair",
      email: "admin@saudevivax.com",
      password: hashedPassword,
      specialty: "General Medicinez",
    });
    await doctorRepo.save(doctor2);
  }

  const patient1 = patientRepo.create({
    name: "João Silva",
    birthDate: new Date("1985-06-15"),
    identificationNumber: "12345678",
    phone: "+351912345678",
    email: "joao.silva@example.com",
  });
  await patientRepo.save(patient1);

  const patient2 = patientRepo.create({
    name: "Maria Santos",
    birthDate: new Date("1990-03-22"),
    identificationNumber: "87654321",
    phone: "+351987654321",
    email: "maria.santos@example.com",
  });
  await patientRepo.save(patient2);

  const patient3 = patientRepo.create({
    name: "Pedro Almeida",
    birthDate: new Date("1978-11-08"),
    identificationNumber: "11223344",
    phone: "+351933444555",
    email: "pedro.almeida@example.com",
  });
  await patientRepo.save(patient3);

  const patient4 = patientRepo.create({
    name: "Sofia Costa",
    birthDate: new Date("1995-05-20"),
    identificationNumber: "55667788",
    phone: "+351944555666",
    email: "sofia.costa@example.com",
  });
  await patientRepo.save(patient4);

  const patient5 = patientRepo.create({
    name: "Miguel Rodrigues",
    birthDate: new Date("1982-08-14"),
    identificationNumber: "99887766",
    phone: "+351955666777",
    email: "miguel.rodrigues@example.com",
  });
  await patientRepo.save(patient5);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment1 = appointmentRepo.create({
    description: "Check-up anual",
    specialty: "Medicina Geral",
    date: new Date(today.setHours(9, 0, 0, 0)),
    doctorId: doctor.id,
    patientId: patient1.id,
  });
  await appointmentRepo.save(appointment1);

  const appointment2 = appointmentRepo.create({
    description: "Seguimento de análises",
    specialty: "Laboratório",
    date: new Date(today.setHours(10, 30, 0, 0)),
    doctorId: doctor.id,
    patientId: patient2.id,
  });
  await appointmentRepo.save(appointment2);

  const appointment3 = appointmentRepo.create({
    description: "Consulta de cardiologia",
    specialty: "Cardiologia",
    date: new Date(tomorrow.setHours(14, 0, 0, 0)),
    doctorId: doctor.id,
    patientId: patient1.id,
  });
  await appointmentRepo.save(appointment3);

  const document = documentRepo.create({
    filename: "relatorio-medico.pdf",
    originalName: "relatorio-medico.pdf",
    mimetype: "application/pdf",
    description: "Relatório médico anual",
    room: "Sala 101",
    location: "Lisboa",
    patientId: patient1.id,
    doctorId: doctor.id,
    appointmentId: appointment1.id,
  });
  await documentRepo.save(document);

  const currentDate = new Date();
  const getDayDate = (
    daysFromToday: number,
    hour: number,
    minute: number = 0,
  ) => {
    const d = new Date(currentDate);
    d.setDate(currentDate.getDate() + daysFromToday);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Consulta de rotina",
      specialty: "Medicina Geral",
      date: getDayDate(0, 9, 0),
      doctorId: doctor.id,
      patientId: patient3.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Revisão de tensão arterial",
      specialty: "Cardiologia",
      date: getDayDate(1, 10, 0),
      doctorId: doctor.id,
      patientId: patient4.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Vacinação",
      specialty: "Medicina Geral",
      date: getDayDate(2, 11, 0),
      doctorId: doctor.id,
      patientId: patient5.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Revisão de resultados laboratoriais",
      specialty: "Laboratório",
      date: getDayDate(3, 14, 0),
      doctorId: doctor.id,
      patientId: patient1.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Consulta de medicina dentária",
      specialty: "Medicina Dentária",
      date: getDayDate(4, 9, 30),
      doctorId: doctor.id,
      patientId: patient2.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Consulta de urgência",
      specialty: "Medicina Geral",
      date: getDayDate(5, 10, 0),
      doctorId: doctor.id,
      patientId: patient3.id,
    }),
  );

  await appointmentRepo.save(
    appointmentRepo.create({
      description: "Consulta de seguimento",
      specialty: "Medicina Geral",
      date: getDayDate(6, 11, 0),
      doctorId: doctor.id,
      patientId: patient4.id,
    }),
  );

  const msg1 = messageRepo.create({
    content: "Olá Dr., gostaria de saber os resultados das análises.",
    senderId: patient1.id,
    senderName: patient1.name,
    senderType: "patient",
    receiverId: doctor.id,
    receiverType: "professional",
  });
  await messageRepo.save(msg1);

  const msg2 = messageRepo.create({
    content: "Olá João, os resultados estão prontos. Pode passar amanhã às 10h.",
    senderId: doctor.id,
    senderName: doctor.name,
    senderType: "professional",
    receiverId: patient1.id,
    receiverType: "patient",
  });
  await messageRepo.save(msg2);

  const msg3 = messageRepo.create({
    content: "Dr., preciso remarcar a consulta de amanhã.",
    senderId: patient2.id,
    senderName: patient2.name,
    senderType: "patient",
    receiverId: doctor.id,
    receiverType: "professional",
  });
  await messageRepo.save(msg3);

  const msg4 = messageRepo.create({
    content: "Bom dia Dr. Administrador! Tem disponíveis algum horário para reunião esta semana?",
    senderId: doctor2.id,
    senderName: doctor2.name,
    senderType: "professional",
    receiverId: doctor.id,
    receiverType: "professional",
  });
  await messageRepo.save(msg4);

  const msg5 = messageRepo.create({
    content: "Olá Dr. Gui, amanhã às 14h está disponível na minha sala.",
    senderId: doctor.id,
    senderName: doctor.name,
    senderType: "professional",
    receiverId: doctor2.id,
    receiverType: "professional",
  });
  await messageRepo.save(msg5);

  console.log("Seed completed successfully!");
}
