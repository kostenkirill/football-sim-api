import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { generateId } from '../common/shared/utils';
import { Match, TeamSide } from './entities/match.entity';
import { TeamWithPlayers } from '../team/entities/team.entity';

@Injectable()
export class MatchService {
  private assertMatchLive(match: Match): void {
    if (!match || match.status !== 'live') {
      throw new ConflictException('Match is not live');
    }
  }

  createMatch(homeTeam: TeamWithPlayers, awayTeam: TeamWithPlayers): Match {
    return {
      id: generateId(`match`),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      status: 'scheduled',
    };
  }

  start(match: Match): Match {
    match.status = 'live';
    Logger.log(`Match started: ${match.homeTeam.name} vs ${match.awayTeam.name}`);
    return match;
  }

  stop(match: Match): Match {
    this.assertMatchLive(match);
    match.status = 'finished';
    Logger.log(
      `Match finished: ${match.homeTeam.name} ${match.homeScore} : ${match.awayScore} ${match.awayTeam.name}`,
    );
    return match;
  }

  reset(match: Match): Match {
    match.homeScore = 0;
    match.awayScore = 0;
    match.status = 'scheduled';
    return match;
  }

  scoreGoal(match: Match, scoringSide: TeamSide): Match {
    this.assertMatchLive(match);
    if (scoringSide === TeamSide.HOME) {
      match.homeScore += 1;
    } else {
      match.awayScore += 1;
    }
    Logger.log(
      `Goal scored: ${match.homeTeam.shortName} ${match.homeScore} : ${match.awayScore} ${match.awayTeam.shortName}`,
    );
    return match;
  }
}
