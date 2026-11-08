import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class ItemQuantidadeDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID()
  id: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  quantidade: number;
}
