import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UpdateUserReqDto } from "./dto/req/update-user-req-dto";
import { CreateUserReqDto } from "./dto/req/create-user-req-dto";

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserReqDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      status: "ACTIVE",
    });
    return await this.userRepository.save(user);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async update(id: number, updateUserDto: UpdateUserReqDto): Promise<User> {
    await this.findById(id);
    await this.userRepository.update(id, updateUserDto);
    return await this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
