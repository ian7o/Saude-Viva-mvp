import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Clinic } from "src/entities/clinic.entity";

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,
  ) {}

  async create(data: Partial<Clinic>): Promise<Clinic> {
    const clinic = this.clinicRepository.create(data);
    return await this.clinicRepository.save(clinic);
  }

  async findAll(): Promise<Clinic[]> {
    return await this.clinicRepository.find();
  }

  async findById(id: number): Promise<Clinic> {
    const clinic = await this.clinicRepository.findOne({
      where: { id },
      relations: ["doctors"],
    });
    if (!clinic) {
      throw new NotFoundException("Clinic not found");
    }
    return clinic;
  }

  async update(id: number, data: Partial<Clinic>): Promise<Clinic> {
    await this.findById(id);
    await this.clinicRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.clinicRepository.delete(id);
  }

  async getDoctors(clinicId: number) {
    const clinic = await this.clinicRepository.findOne({
      where: { id: clinicId },
      relations: ["doctors"],
    });
    if (!clinic) throw new NotFoundException("Clinic not found");
    return clinic.doctors;
  }
}
