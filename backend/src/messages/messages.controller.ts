import { Controller, Get, Post, Body, Param, UseGuards } from "@nestjs/common";
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
  getContacts(
    @CurrentUser() user: { id: number; role: string; patientId?: number },
  ) {
    if (user.role === "patient") {
      return this.messagesService.getProfessionalContacts(user.patientId!);
    }
    if (user.role === "admin") {
      const userType = "professional";
      return this.messagesService.getContacts(user.id, userType);
    }
    const userType = user.role === "doctor" ? "professional" : "patient";
    return this.messagesService.getContacts(user.id, userType);
  }

  @Post()
  @ApiOperation({ summary: "Send a message" })
  send(
    @CurrentUser()
    user: { id: number; name: string; role: string; patientId?: number },
    @Body()
    body: {
      content: string;
      receiverId: number;
      receiverType: "patient" | "professional";
    },
  ) {
    if (user.role === "patient") {
      return this.messagesService.send({
        content: body.content,
        senderId: user.patientId!,
        senderName: user.name,
        senderType: "patient",
        receiverId: body.receiverId,
        receiverType: body.receiverType,
      });
    }
    const senderType =
      user.role === "doctor" || user.role === "admin"
        ? "professional"
        : "patient";
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
    @CurrentUser() user: { id: number; role: string; patientId?: number },
    @Param("contactId") contactId: number,
    @Param("contactType") contactType: "patient" | "professional",
  ) {
    if (user.role === "patient") {
      return this.messagesService.getHistory(
        user.patientId!,
        contactId,
        contactType,
        "patient",
      );
    }
    const userType =
      user.role === "doctor" || user.role === "admin"
        ? "professional"
        : "patient";
    return this.messagesService.getHistory(
      user.id,
      contactId,
      contactType,
      userType,
    );
  }
}
