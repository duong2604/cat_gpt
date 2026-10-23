import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { TrimLower } from '../../../common/validation/transforms.js';

export class LoginDto {
  @ApiProperty({ example: 'admin@catgpt.local' })
  @TrimLower()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'Admin@123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
