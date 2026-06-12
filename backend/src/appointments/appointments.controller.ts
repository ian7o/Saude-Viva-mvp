import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@ApiTags("appointments")
@Controller("appointments")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: "Get all appointments for current user" })
  findAll(
    @CurrentUser() user: { id: number; role: string; patientId?: number; clinicId?: number },
  ) {
    if (user.role === "patient") {
      return this.appointmentsService.findByPatient(user.patientId!);
    }
    if (user.role === "admin") {
      return this.appointmentsService.findAll();
    }
    return this.appointmentsService.findByDoctor(user.id);
  }

  @Get("today")
  @ApiOperation({ summary: "Get today appointments for current user" })
  findToday(
    @CurrentUser() user: { id: number; role: string; patientId?: number },
  ) {
    const today = new Date();
    if (user.role === "patient") {
      return this.appointmentsService.findByPatientAndDate(
        user.patientId!,
        today,
      );
    }
    return this.appointmentsService.findByDoctorAndDate(user.id, today);
  }

  @Get("range")
  @ApiOperation({
    summary: "Get appointments by date range with optional filters",
  })
  findByRange(
    @CurrentUser() user: { id: number; role: string; patientId?: number; clinicId?: number },
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("doctorId") doctorId?: string,
    @Query("specialty") specialty?: string,
    @Query("clinicId") clinicId?: string,
  ) {
    if (user.role === "patient") {
      return this.appointmentsService.findByPatientAndDateRange(
        user.patientId!,
        new Date(startDate),
        new Date(endDate),
      );
    }
    if (user.role === "secretary" || user.role === "admin" || doctorId) {
      return this.appointmentsService.findByDateRange(
        new Date(startDate),
        new Date(endDate),
        doctorId ? parseInt(doctorId) : undefined,
        specialty,
        clinicId ? parseInt(clinicId) : user.clinicId,
      );
    }
    return this.appointmentsService.findByDoctorAndDateRange(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get appointment by ID" })
  findOne(@Param("id") id: number) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: "Create appointment" })
  create(
    @Body() createDto: CreateAppointmentDto,
    @CurrentUser() user: { id: number; role: string; patientId?: number; clinicId?: number },
  ) {
    const data = {
      ...createDto,
      date: new Date(createDto.date),
      patientId:
        user.role === "patient"
          ? user.patientId
          : createDto.patientId
            ? Number(createDto.patientId)
            : undefined,
      clinicId: createDto.clinicId ?? user.clinicId,
    };
    return this.appointmentsService.create(data);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update appointment" })
  update(
    @Param("id") id: number,
    @Body() updateDto: UpdateAppointmentDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    if (user.role !== "doctor" && user.role !== "admin") {
      throw new ForbiddenException("Apenas médicos podem editar consultas");
    }
    const data = {
      ...updateDto,
      date: updateDto.date ? new Date(updateDto.date) : undefined,
    };
    return this.appointmentsService.update(id, data, user.id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete appointment" })
  delete(@Param("id") id: number) {
    return this.appointmentsService.delete(id);
  }
}
