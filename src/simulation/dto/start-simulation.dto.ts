import { IsString, Matches } from 'class-validator';

export class StartSimulationDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9 ]{8,30}$/, {
    message: 'Name must be 8-30 characters, letters, digits or spaces only',
  })
  name!: string;
}
