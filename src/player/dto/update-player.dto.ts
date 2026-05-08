import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlayerDto {
  @ApiPropertyOptional({ example: 'team-1' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  teamId?: string;

  @ApiPropertyOptional({ example: 'Lionel' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Messi' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  lastName?: string;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 99 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  shirtNumber?: number;

  @ApiPropertyOptional({
    example: 'Forward',
    enum: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
  })
  @IsOptional()
  @IsString()
  @Matches(/^(Goalkeeper|Defender|Midfielder|Forward)$/)
  position?: string;
}
