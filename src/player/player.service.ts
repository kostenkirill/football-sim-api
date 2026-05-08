import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PrismaService } from '../prisma/prisma.service';
import { generateId } from '../common/shared/utils';

@Injectable()
export class PlayerService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Player[]> {
    return this.prisma.player.findMany();
  }

  async findById(id: string): Promise<Player> {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException(`Player with id ${id} not found`);
    return player;
  }

  findByTeamId(teamId: string): Promise<Player[]> {
    return this.prisma.player.findMany({ where: { teamId } });
  }

  async create(dto: CreatePlayerDto): Promise<Player> {
    await this.ensureTeamExists(dto.teamId);
    const player: Player = {
      id: generateId('player'),
      teamId: dto.teamId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      shirtNumber: dto.shirtNumber,
      position: dto.position,
    };
    await this.prisma.player.create({ data: player });
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto): Promise<Player> {
    await this.findById(id);

    if (dto.teamId) await this.ensureTeamExists(dto.teamId);

    return this.prisma.player.update({
      where: { id },
      data: dto,
    });
  }

  private async ensureTeamExists(teamId: string): Promise<void> {
    const teamExists = await this.prisma.team.count({ where: { id: teamId } });
    if (!teamExists) {
      throw new BadRequestException(`Team with id ${teamId} does not exist`);
    }
  }
}
