import { Player } from '../../player/entities/player.entity';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  countryCode: string;
}

export interface TeamWithPlayers extends Team {
  players: Player[];
}
