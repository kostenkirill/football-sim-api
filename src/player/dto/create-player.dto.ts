import { IsInt, IsString, Length, Matches, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlayerDto {
  @ApiProperty({ example: 'team-1' })
  @IsString()
  @Length(1, 60)
  teamId!: string;

  @ApiProperty({ example: 'Lionel' })
  @IsString()
  @Length(1, 60)
  firstName!: string;

  @ApiProperty({ example: 'Messi' })
  @IsString()
  @Length(1, 60)
  lastName!: string;

  @ApiProperty({ example: 10, minimum: 1, maximum: 99 })
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber!: number;

  @ApiProperty({
    example: 'Forward',
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  })
  @IsString()
  @Matches(/^(Goalkeeper|Defender|Midfielder|Forward)$/)
  position!: string;
}
