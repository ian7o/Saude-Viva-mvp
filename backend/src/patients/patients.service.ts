import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "src/entities/patient.entity";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException("Patient not found");
    }
    return patient;
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(data);
    return await this.patientRepository.save(patient);
  }

  async update(id: number, data: Partial<Patient>): Promise<Patient> {
    await this.patientRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.patientRepository.delete(id);
  }
}
