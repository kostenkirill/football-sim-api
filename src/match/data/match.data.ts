import { TEAMS } from '../../team/data/teams.data';
import { MatchUp } from '../entities/match.entity';

export const MATCHUPS: MatchUp[] = [
  {
    homeTeam: TEAMS[0],
    awayTeam: TEAMS[1],
  },
  {
    homeTeam: TEAMS[2],
    awayTeam: TEAMS[3],
  },
  {
    homeTeam: TEAMS[4],
    awayTeam: TEAMS[5],
  },
];
