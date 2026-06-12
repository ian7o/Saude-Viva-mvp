import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserReqDto } from "./dto/req/create-user-req-dto";
import { UpdateUserReqDto } from "./dto/req/update-user-req-dto";
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@ApiTags("users")
@Controller("users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"), RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("admin")
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: CreateUserReqDto })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createUserDto: CreateUserReqDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles("admin")
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "List of users" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", description: "User ID", type: Number })
  @ApiResponse({ status: 200, description: "User found" })
  @ApiResponse({ status: 404, description: "User not found" })
  findById(@Param("id") id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Update user by ID" })
  @ApiParam({ name: "id", description: "User ID", type: Number })
  @ApiBody({ type: UpdateUserReqDto })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserReqDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @Roles("admin")
  @ApiOperation({ summary: "Delete user by ID" })
  @ApiParam({ name: "id", description: "User ID", type: Number })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  remove(@Param("id") id: string) {
    return this.usersService.removeById(+id);
  }
}
