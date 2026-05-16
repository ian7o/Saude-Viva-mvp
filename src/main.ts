import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './HttpExceptionFilter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { ClinicalDocument } from './entities/clinical-document.entity';
import { User } from './users/entities/user.entity';

async function seed(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const doctorRepo = dataSource.getRepository(Doctor);
  const patientRepo = dataSource.getRepository(Patient);
  const appointmentRepo = dataSource.getRepository(Appointment);
  const documentRepo = dataSource.getRepository(ClinicalDocument);

  const existingUser = await userRepo.findOne({ where: { email: 'admin@saudeviva.com' } });
  if (existingUser) return;

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = userRepo.create({
    email: 'admin@saudeviva.com',
    name: 'Dr. Admin',
    password: hashedPassword,
    age: 35,
    sex: 'male',
  });
  await userRepo.save(user);

  const doctor = doctorRepo.create({
    name: 'Dr. Admin',
    email: 'admin@saudeviva.com',
    password: hashedPassword,
    specialty: 'General Medicine',
  });
  await doctorRepo.save(doctor);

  const patient1 = patientRepo.create({
    name: 'John Doe',
    birthDate: new Date('1985-06-15'),
    identificationNumber: '12345678',
    phone: '+351912345678',
    email: 'john.doe@example.com',
  });
  await patientRepo.save(patient1);

  const patient2 = patientRepo.create({
    name: 'Jane Smith',
    birthDate: new Date('1990-03-22'),
    identificationNumber: '87654321',
    phone: '+351987654321',
    email: 'jane.smith@example.com',
  });
  await patientRepo.save(patient2);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointment1 = appointmentRepo.create({
    description: 'Annual checkup',
    specialty: 'General Medicine',
    date: new Date(today.setHours(9, 0, 0, 0)),
    doctorId: doctor.id,
    patientId: patient1.id,
  });
  await appointmentRepo.save(appointment1);

  const document = documentRepo.create({
    filename: 'sample-report.pdf',
    originalName: 'medical-report.pdf',
    mimetype: 'application/pdf',
    description: 'Annual medical report',
    room: 'Room 101',
    location: 'Lisbon',
    patientId: patient1.id,
    doctorId: doctor.id,
    appointmentId: appointment1.id,
  });
  await documentRepo.save(document);

  console.log('Seed completed successfully!');
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const dataSource = app.get(DataSource);
  await seed(dataSource);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/api/uploads',
  });

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Saude Viva API')
    .setDescription(
      'API documentation for Saude Viva - Clinic Management System',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('doctors', 'Doctor management endpoints')
    .addTag('appointments', 'Appointment management endpoints')
    .addTag('patients', 'Patient management endpoints')
    .addTag('documents', 'Document management endpoints')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(Number(process.env.app_port) || 4000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
