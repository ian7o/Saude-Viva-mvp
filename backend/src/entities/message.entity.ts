import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  content: string;

  @Column()
  senderId: number;

  @Column()
  senderName: string;

  @Column()
  senderType: "patient" | "professional";

  @Column()
  receiverId: number;

  @Column()
  receiverType: "patient" | "professional";

  @CreateDateColumn()
  createdAt: Date;
}