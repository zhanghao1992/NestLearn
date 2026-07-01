import { IsString, MaxLength, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: '官网改版' })
  @IsString()
  @MinLength(1, { message: '项目名称不能为空' })
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({ example: 'Q3 优先项目' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
