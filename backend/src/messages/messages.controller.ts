import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { MessagesService } from "./messages.service";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@ApiTags("messages")
@Controller("messages")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("contacts")
  @ApiOperation({ summary: "Get all contacts with messages" })
  getContacts(@CurrentUser() user: { id: number; role: string }) {
    const userType = user.role === "doctor" ? "professional" : "patient";
    return this.messagesService.getContacts(user.id, userType);
  }

  @Post()
  @ApiOperation({ summary: "Send a message" })
  send(
    @CurrentUser() user: { id: number; name: string; role: string },
    @Body() body: { content: string; receiverId: number; receiverType: "patient" | "professional" },
  ) {
    const senderType = user.role === "doctor" ? "professional" : "patient";
    return this.messagesService.send({
      content: body.content,
      senderId: user.id,
      senderName: user.name,
      senderType,
      receiverId: body.receiverId,
      receiverType: body.receiverType,
    });
  }

  @Get(":contactId/:contactType")
  @ApiOperation({ summary: "Get message history with a contact" })
  getHistory(
    @CurrentUser() user: { id: number; role: string },
    @Param("contactId") contactId: number,
    @Param("contactType") contactType: "patient" | "professional",
  ) {
    const userType = user.role === "doctor" ? "professional" : "patient";
    return this.messagesService.getHistory(user.id, contactId, contactType, userType);
  }
}