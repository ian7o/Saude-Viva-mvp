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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('appointments')
@Controller('appointments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all appointments for current doctor' })
  findAll(@CurrentUser() user: { id: number }) {
    return this.appointmentsService.findByDoctor(user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today appointments for current doctor' })
  findToday(@CurrentUser() user: { id: number }) {
    const today = new Date();
    return this.appointmentsService.findByDoctorAndDate(user.id, today);
  }

  @Get('range')
  @ApiOperation({ summary: 'Get appointments by date range' })
  findByRange(
    @CurrentUser() user: { id: number },
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.appointmentsService.findByDoctorAndDateRange(
      user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  findOne(@Param('id') id: number) {
    return this.appointmentsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  create(@Body() createDto: CreateAppointmentDto) {
    const data = {
      ...createDto,
      date: new Date(createDto.date),
    };
    return this.appointmentsService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment' })
  update(@Param('id') id: number, @Body() updateDto: UpdateAppointmentDto) {
    const data = {
      ...updateDto,
      date: updateDto.date ? new Date(updateDto.date) : undefined,
    };
    return this.appointmentsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  delete(@Param('id') id: number) {
    return this.appointmentsService.delete(id);
  }
}
