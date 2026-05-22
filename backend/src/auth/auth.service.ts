import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UsersRepository } from "src/users/users.repository";

interface ValidatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<ValidatedUser | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const result: ValidatedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "doctor",
        };
        return result;
      }
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.usersRepository.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersRepository.create({
      email,
      name,
      password: hashedPassword,
      age: 0,
      sex: "male",
    });
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      age: user.age,
      sex: user.sex,
      status: user.status,
      role: user.role || "doctor",
    };
    const payload = { sub: result.id, email: result.email, role: result.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: result,
    };
  }
}
