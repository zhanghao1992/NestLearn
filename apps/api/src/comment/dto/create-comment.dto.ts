import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: '这个任务我来负责' })
  @IsString()
  @MinLength(1, { message: '评论内容不能为空' })
  @MaxLength(2000)
  content!: string;
}
