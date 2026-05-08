import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Germany', minLength: 2, maxLength: 60 })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  name?: string;

  @ApiPropertyOptional({ example: 'GER', pattern: '^[A-Z]{3}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  shortName?: string;

  @ApiPropertyOptional({ example: 'DE', pattern: '^[A-Z]{2}$' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryCode?: string;
}
