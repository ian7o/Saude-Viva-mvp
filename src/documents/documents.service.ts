import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClinicalDocument } from 'src/entities/clinical-document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(ClinicalDocument)
    private readonly documentRepository: Repository<ClinicalDocument>,
  ) {}

  async findAll(doctorId?: number): Promise<ClinicalDocument[]> {
    const whereCondition = doctorId ? { doctorId } : {};
    return await this.documentRepository.find({
      where: whereCondition,
      relations: ['patient', 'doctor', 'appointment'],
      order: { uploadDate: 'DESC' },
    });
  }

  async findByDoctor(doctorId: number): Promise<ClinicalDocument[]> {
    return await this.documentRepository.find({
      where: { doctorId },
      relations: ['patient', 'doctor', 'appointment'],
      order: { uploadDate: 'DESC' },
    });
  }

  async findByPatient(patientId: number): Promise<ClinicalDocument[]> {
    return await this.documentRepository.find({
      where: { patientId },
      relations: ['patient', 'doctor', 'appointment'],
      order: { uploadDate: 'DESC' },
    });
  }

  async findById(id: number): Promise<ClinicalDocument> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment'],
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async create(data: Partial<ClinicalDocument>): Promise<ClinicalDocument> {
    const document = this.documentRepository.create(data);
    return await this.documentRepository.save(document);
  }

  async update(
    id: number,
    data: Partial<ClinicalDocument>,
  ): Promise<ClinicalDocument> {
    await this.documentRepository.update(id, data);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.documentRepository.delete(id);
  }
}
