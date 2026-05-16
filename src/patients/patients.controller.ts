import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('patients')
@Controller('patients')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  findAll() {
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  findOne(@Param('id') id: number) {
    return this.patientsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create patient' })
  create(@Body() createDto: CreatePatientDto) {
    const data = {
      ...createDto,
      birthDate: createDto.birthDate
        ? new Date(createDto.birthDate)
        : undefined,
    };
    return this.patientsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient' })
  update(@Param('id') id: number, @Body() updateDto: UpdatePatientDto) {
    const data = {
      ...updateDto,
      birthDate: updateDto.birthDate
        ? new Date(updateDto.birthDate)
        : undefined,
    };
    return this.patientsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  delete(@Param('id') id: number) {
    return this.patientsService.delete(id);
  }
}
