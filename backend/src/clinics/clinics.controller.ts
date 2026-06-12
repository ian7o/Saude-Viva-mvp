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
import { ClinicsService } from "./clinics.service";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@ApiTags("clinics")
@Controller("clinics")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Create a clinic" })
  create(@Body() data: { name: string; address?: string; phone?: string; email?: string }) {
    return this.clinicsService.create(data);
  }

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Get all clinics" })
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get clinic by ID" })
  findById(@Param("id") id: string) {
    return this.clinicsService.findById(+id);
  }

  @Put(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update clinic" })
  update(@Param("id") id: string, @Body() data: { name?: string; address?: string; phone?: string; email?: string }) {
    return this.clinicsService.update(+id, data);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete clinic" })
  delete(@Param("id") id: string) {
    return this.clinicsService.delete(+id);
  }

  @Get(":id/doctors")
  @Roles("admin")
  @ApiOperation({ summary: "Get doctors from clinic" })
  getDoctors(@Param("id") id: string) {
    return this.clinicsService.getDoctors(+id);
  }

}
