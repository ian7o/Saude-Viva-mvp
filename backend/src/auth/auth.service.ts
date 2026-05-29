import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersRepository } from "src/users/users.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "src/entities/patient.entity";

interface ValidatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  patientId?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (user && user.password) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "doctor",
          patientId: user.patientId || undefined,
        };
      }
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        patientId: user.patientId,
      },
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      age: 0,
      sex: "male",
    });
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      sex: user.sex,
      status: user.status,
      role: user.role || "doctor",
    };
    const payload = { sub: result.id, email: result.email, role: result.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }

  async seedPatients() {
    const patients = await this.patientRepository.find();
    let created = 0;

    for (const patient of patients) {
      const existingUser = await this.usersRepository.findByEmail(
        patient.email || `paciente${patient.id}@clinica.com`,
      );
      if (existingUser) continue;

      const email = patient.email || `paciente${patient.id}@clinica.com`;
      const hashedPassword = await bcrypt.hash("paciente123", 10);

      await this.usersRepository.create({
        email,
        name: patient.name,
        password: hashedPassword,
        age: 0,
        sex: "male",
        role: "patient",
        patientId: patient.id,
      });
      created++;
    }

    return { message: `Created ${created} patient user accounts` };
  }
}
