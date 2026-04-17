import { Injectable, NotFoundException } from '@nestjs/common';
import { TEAMS } from './data/teams.data';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamService {
  findAll(): Team[] {
    return TEAMS;
  }
  findById(id: string): Team {
    const team = TEAMS.find((t) => t.id === id);
    if (!team) throw new NotFoundException(`Team with id ${id} not found`);
    return team;
  }
}
