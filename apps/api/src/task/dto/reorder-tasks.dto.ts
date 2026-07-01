import { IsArray, IsInt, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/** 单个任务的排序项 */
export class TaskOrderItem {
  @ApiProperty()
  @IsUUID()
  id!: string;

  @ApiProperty({ description: '新位置（序号）' })
  @IsInt()
  @Type(() => Number)
  order!: number;
}

/** 批量重排序：前端传有序数组，后端按顺序重算 position */
export class ReorderTasksDto {
  @ApiProperty({ type: [TaskOrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskOrderItem)
  items!: TaskOrderItem[];
}
