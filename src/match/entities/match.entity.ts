import { Team } from '../../team/entities/team.entity';

type MatchStatus = 'scheduled' | 'live' | 'finished';

export enum TeamSide {
  HOME,
  AWAY,
}
export interface MatchUp {
  homeTeam: Team;
  awayTeam: Team;
}
export interface Match extends MatchUp {
  id: string;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
}
