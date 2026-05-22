import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { Appointment } from "src/entities/appointment.entity";

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { doctorId },
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    doctorId?: number,
    specialty?: string,
  ): Promise<Appointment[]> {
    const where: any = {
      date: Between(startDate, endDate),
    };
    if (doctorId) where.doctorId = doctorId;
    if (specialty) where.specialty = specialty;

    return await this.appointmentRepository.find({
      where,
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findByDoctorAndDateRange(
    doctorId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return await this.findByDateRange(startDate, endDate, doctorId);
  }

  async findByDoctorAndDate(
    doctorId: number,
    date: Date,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.appointmentRepository.find({
      where: {
        doctorId,
        date: Between(startOfDay, endOfDay),
      },
      relations: ["patient", "doctor"],
      order: { date: "ASC" },
    });
  }

  async findById(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ["patient", "doctor"],
    });
    if (!appointment) {
      throw new NotFoundException("Appointment not found");
    }
    return appointment;
  }

  async checkAvailability(
    doctorId: number,
    date: Date,
    excludeAppointmentId?: number,
  ): Promise<boolean> {
    const startWindow = new Date(date.getTime() - 30 * 60 * 1000);
    const endWindow = new Date(date.getTime() + 30 * 60 * 1000);

    const appointments = await this.appointmentRepository.find({
      where: {
        doctorId,
        date: Between(startWindow, endWindow),
      },
    });

    if (appointments.length > 0) {
      if (excludeAppointmentId === undefined) {
        return false;
      }
      const excludeId = excludeAppointmentId;
      const hasOtherConflict = appointments.some((apt) => apt.id !== excludeId);
      if (hasOtherConflict) {
        return false;
      }
    }
    return true;
  }

  async create(data: Partial<Appointment>): Promise<Appointment> {
    if (!data.doctorId || !data.date) {
      throw new BadRequestException("Médico e data são obrigatórios");
    }
    const available = await this.checkAvailability(data.doctorId, data.date);
    if (!available) {
      throw new ConflictException(
        "O médico já tem uma consulta agendada neste horário",
      );
    }
    const appointment = this.appointmentRepository.create(data);
    return await this.appointmentRepository.save(appointment);
  }

  async update(
    id: number,
    data: Partial<Appointment>,
    userId?: number,
  ): Promise<Appointment> {
    if (data.date || data.doctorId) {
      const doctorId = data.doctorId || (await this.findById(id)).doctorId;
      const date = data.date || (await this.findById(id)).date;
      const available = await this.checkAvailability(doctorId, date, id);
      if (!available) {
        throw new ConflictException(
          "O médico já tem uma consulta agendada neste horário",
        );
      }
    }

    const updateData = {
      ...data,
      editedBy: userId,
      editedAt: new Date(),
    };

    await this.appointmentRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.appointmentRepository.delete(id);
  }
}
