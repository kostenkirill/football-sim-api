import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { TeamService } from '../team/team.service';
import { generateId } from '../common/shared/utils';
import { Match, TeamSide } from './entities/match.entity';

@Injectable()
export class MatchService {
  private match = {} as Match;

  get(): Match {
    return this.match;
  }
  private assertMatchLive(): void {
    if (!this.match || this.match.status !== 'live') {
      throw new ConflictException('Match is not live');
    }
  }

  createMatch(
    homeTeamId: string,
    awayTeamId: string,
    teamService: TeamService,
  ): Match {
    const homeTeam = teamService.findById(homeTeamId);
    const awayTeam = teamService.findById(awayTeamId);
    const match: Match = {
      id: generateId(`match`),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      status: 'scheduled',
    };
    this.match = match;
    return match;
  }
  start(): Match {
    this.match.status = 'live';
    Logger.log(
      `Match started: ${this.match.homeTeam.name} vs ${this.match.awayTeam.name}`,
    );
    return this.match;
  }
  stop(): Match {
    this.assertMatchLive();
    this.match.status = 'finished';
    Logger.log(
      `Match finished: ${this.match.homeTeam.name} ${this.match.homeScore} : ${this.match.awayScore} ${this.match.awayTeam.name}`,
    );
    return this.match;
  }

  reset(): Match {
    this.match.homeScore = 0;
    this.match.awayScore = 0;
    this.match.status = 'scheduled';
    return this.match;
  }

  scoreGoal(scoringSide: TeamSide): Match {
    this.assertMatchLive();
    if (scoringSide === TeamSide.HOME) {
      this.match.homeScore += 1;
    } else {
      this.match.awayScore += 1;
    }
    Logger.log(
      `Goal scored: ${this.match.homeTeam.shortName} ${this.match.homeScore} : ${this.match.awayScore} ${this.match.awayTeam.shortName}`,
    );
    return this.match;
  }
}
