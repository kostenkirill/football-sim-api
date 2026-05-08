import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Germany', minLength: 2, maxLength: 60 })
  @IsString()
  @Length(2, 60)
  name!: string;

  @ApiProperty({ example: 'GER', pattern: '^[A-Z]{3}$' })
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  shortName!: string;

  @ApiProperty({ example: 'DE', pattern: '^[A-Z]{2}$' })
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryCode!: string;
}
