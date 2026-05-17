import { PartialType } from "@nestjs/mapped-types";
import { CreateUserReqDto } from "./create-user-req-dto";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserReqDto extends PartialType(CreateUserReqDto) {
  @ApiProperty({
    example: "user@example.com",
    description: "User email address",
    required: false,
  })
  email?: string;

  @ApiProperty({
    example: "John Doe",
    description: "User name",
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 25,
    description: "User age",
    minimum: 12,
    maximum: 100,
    required: false,
  })
  age?: number;

  @ApiProperty({
    example: "male",
    description: "User sex",
    enum: ["male", "female", "other"],
    required: false,
  })
  sex?: string;
}
