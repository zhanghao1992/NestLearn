import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: '我的团队' })
  @IsString()
  @MinLength(1, { message: '名称不能为空' })
  @MaxLength(50)
  name!: string;
}
