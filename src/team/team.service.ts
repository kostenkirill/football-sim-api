import { Injectable, NotFoundException } from '@nestjs/common';
import { Team, TeamWithPlayers } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generateId } from '../common/shared/utils';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<TeamWithPlayers[]> {
    const teams = await this.prisma.team.findMany({
      include: { players: true },
    });
    return teams.map((team) => ({
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      countryCode: team.countryCode,
      players: team.players,
    }));
  }

  async findById(id: string): Promise<TeamWithPlayers> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: { players: true },
    });
    if (!team) throw new NotFoundException(`Team with id ${id} not found`);
    const { players, ...teamFields } = team;
    return { ...teamFields, players };
  }

  async create(dto: CreateTeamDto): Promise<TeamWithPlayers> {
    const team: Team = {
      id: generateId('team'),
      name: dto.name,
      shortName: dto.shortName,
      countryCode: dto.countryCode,
    };
    await this.prisma.team.create({ data: team });
    return this.findById(team.id);
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamWithPlayers> {
    await this.findById(id);
    await this.prisma.team.update({
      where: { id },
      data: dto,
    });
    return this.findById(id);
  }
}
