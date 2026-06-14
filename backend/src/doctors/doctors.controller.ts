import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { DoctorsService } from "./doctors.service";
import * as bcrypt from "bcryptjs";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";

@ApiTags("doctors")
@Controller("doctors")
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Get()
  @ApiOperation({ summary: "Get all doctors" })
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get doctor by ID" })
  findOne(@Param("id") id: number) {
    return this.doctorsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a doctor (admin only)" })
  async create(
    @Body()
    data: {
      name: string;
      email: string;
      password: string;
      specialty?: string;
      clinicId?: number;
    },
  ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const doctor = await this.doctorsService.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      specialty: data.specialty,
      clinicId: data.clinicId,
    });
    const user = this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: "doctor",
      doctorId: doctor.id,
      clinicId: data.clinicId,
    });
    await this.userRepository.save(user);
    return doctor;
  }

  @Put(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a doctor (admin only)" })
  async update(
    @Param("id") id: number,
    @Body()
    data: {
      name?: string;
      email?: string;
      specialty?: string;
      clinicId?: number;
    },
  ) {
    return this.doctorsService.update(id, data);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a doctor (admin only)" })
  async delete(@Param("id") id: number) {
    const doctor = await this.doctorsService.findById(id);
    if (doctor) {
      const user = await this.userRepository.findOne({
        where: { email: doctor.email },
      });
      if (user) {
        await this.userRepository.delete(user.id);
      }
    }
    return this.doctorsService.delete(id);
  }
}
