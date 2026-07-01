import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'alice@example.com', description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @ApiProperty({ example: 'password123', description: '密码（至少 6 位）' })
  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  @MaxLength(32, { message: '密码最多 32 位' })
  password!: string;

  @ApiProperty({ example: 'Alice', description: '用户名' })
  @IsString()
  @MinLength(1, { message: '用户名不能为空' })
  @MaxLength(50, { message: '用户名最多 50 位' })
  name!: string;
}
