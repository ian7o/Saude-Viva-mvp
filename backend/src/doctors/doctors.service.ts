import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Doctor } from "src/entities/doctor.entity";

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async findAll(): Promise<Doctor[]> {
    return await this.doctorRepository.find();
  }

  async findById(id: number): Promise<Doctor | null> {
    return await this.doctorRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<Doctor | null> {
    return await this.doctorRepository.findOne({ where: { email } });
  }

  async create(data: Partial<Doctor>): Promise<Doctor> {
    const doctor = this.doctorRepository.create(data);
    return await this.doctorRepository.save(doctor);
  }

  async update(id: number, data: Partial<Doctor>): Promise<Doctor | null> {
    await this.doctorRepository.update(id, data);
    return await this.findById(id);
  }
}
