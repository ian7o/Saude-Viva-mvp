import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from "@nestjs/swagger";
import type { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { DocumentsService } from "./documents.service";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { UpdateDocumentDto } from "./dto/update-document.dto";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { ClinicalDocument } from "src/entities/clinical-document.entity";

@ApiTags("documents")
@Controller("documents")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: "Get all documents for current doctor" })
  findAll(@CurrentUser() user: { id: number }) {
    return this.documentsService.findByDoctor(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get document by ID" })
  findOne(@Param("id") id: number) {
    return this.documentsService.findById(id);
  }

  @Post("upload")
  @ApiOperation({ summary: "Upload document" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDto: CreateDocumentDto,
    @CurrentUser() user: { id: number },
  ) {
    const documentData: Partial<ClinicalDocument> = {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      path: file.path,
      description: createDto.description,
      room: createDto.room,
      location: createDto.location,
      patientId: createDto.patientId ? Number(createDto.patientId) : undefined,
      doctorId: user.id,
      appointmentId: createDto.appointmentId
        ? Number(createDto.appointmentId)
        : undefined,
    };
    return this.documentsService.create(documentData);
  }

  @Get(":id/download")
  @ApiOperation({ summary: "Download document" })
  async download(@Param("id") id: number, @Res() res: Response) {
    const document = await this.documentsService.findById(id);
    res.download(document.path, document.originalName);
  }

  @Get(":id/view")
  @ApiOperation({ summary: "View document" })
  async view(@Param("id") id: number, @Res() res: Response) {
    const document = await this.documentsService.findById(id);
    res.sendFile(document.path, { root: "." });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update document metadata" })
  update(@Param("id") id: number, @Body() updateDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete document" })
  delete(@Param("id") id: number) {
    return this.documentsService.delete(id);
  }
}
