import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "src/entities/message.entity";
import { Patient } from "src/entities/patient.entity";
import { Doctor } from "src/entities/doctor.entity";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async getContacts(userId: number, userType: "patient" | "professional") {
    const patients = await this.patientRepository.find();
    const doctors = await this.doctorRepository.find();

    const patientContacts = await Promise.all(
      patients.map(async (patient) => {
        const lastMessage = await this.messageRepository.findOne({
          where: [
            {
              senderId: patient.id,
              senderType: "patient",
              receiverId: userId,
              receiverType: userType,
            },
            {
              senderId: userId,
              senderType: userType,
              receiverId: patient.id,
              receiverType: "patient",
            },
          ],
          order: { createdAt: "DESC" },
        });
        return {
          id: patient.id,
          name: patient.name,
          type: "patient" as const,
          lastMessage: lastMessage?.content || null,
          lastMessageDate: lastMessage?.createdAt || null,
        };
      }),
    );

    const professionalContacts = await Promise.all(
      doctors
        .filter((d) => d.id !== userId)
        .map(async (doctor) => {
          const lastMessage = await this.messageRepository.findOne({
            where: [
              {
                senderId: doctor.id,
                senderType: "professional",
                receiverId: userId,
                receiverType: userType,
              },
              {
                senderId: userId,
                senderType: userType,
                receiverId: doctor.id,
                receiverType: "professional",
              },
            ],
            order: { createdAt: "DESC" },
          });
          return {
            id: doctor.id,
            name: doctor.name,
            type: "professional" as const,
            lastMessage: lastMessage?.content || null,
            lastMessageDate: lastMessage?.createdAt || null,
          };
        }),
    );

    const allContacts = [...patientContacts, ...professionalContacts].filter(
      (c) => c.lastMessage !== null,
    );

    return allContacts.sort((a, b) => {
      if (!a.lastMessageDate) return 1;
      if (!b.lastMessageDate) return -1;
      return (
        new Date(b.lastMessageDate).getTime() -
        new Date(a.lastMessageDate).getTime()
      );
    });
  }

  async getHistory(
    userId: number,
    contactId: number,
    contactType: "patient" | "professional",
    userType: "patient" | "professional",
  ) {
    const messages = await this.messageRepository.find({
      where: [
        {
          senderId: userId,
          senderType: userType,
          receiverId: contactId,
          receiverType: contactType,
        },
        {
          senderId: contactId,
          senderType: contactType,
          receiverId: userId,
          receiverType: userType,
        },
      ],
      order: { createdAt: "ASC" },
    });

    return messages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.senderName,
      senderType: msg.senderType,
      createdAt: msg.createdAt,
      isOwn: msg.senderId === userId && msg.senderType === userType,
    }));
  }

  async send(data: {
    content: string;
    senderId: number;
    senderName: string;
    senderType: "patient" | "professional";
    receiverId: number;
    receiverType: "patient" | "professional";
  }) {
    const message = this.messageRepository.create(data);
    return await this.messageRepository.save(message);
  }
}
