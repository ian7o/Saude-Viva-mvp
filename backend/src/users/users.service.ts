import { Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { CreateUserReqDto } from "./dto/req/create-user-req-dto";
import { UpdateUserReqDto } from "./dto/req/update-user-req-dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  create(createUserDto: CreateUserReqDto) {
    return this.usersRepository.create(createUserDto);
  }

  findAll() {
    return this.usersRepository.findAll();
  }

  findById(id: number) {
    return this.usersRepository.findById(id);
  }

  update(id: number, updateUserDto: UpdateUserReqDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  async removeById(id: number) {
    await this.usersRepository.delete(id);
    return { message: "User removed successfully" };
  }
}
