import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Match } from '../../match/entities/match.entity';
import { Simulation } from '../../simulation/entities/simulation.entity';
import { Prisma } from '@prisma/client';

type SimulationWithMatches = Prisma.SimulationGetPayload<{
  include: {
    matches: {
      include: {
        homeTeam: { include: { players: true } };
        awayTeam: { include: { players: true } };
      };
    };
  };
}>;

type MatchWithTeams = Prisma.MatchGetPayload<{
  include: {
    homeTeam: { include: { players: true } };
    awayTeam: { include: { players: true } };
  };
}>;

@Injectable()
export class SimulationStore {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(): Promise<Simulation[]> {
    const simulations = await this.db.simulation.findMany({
      include: {
        matches: {
          include: {
            homeTeam: { include: { players: true } },
            awayTeam: { include: { players: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return simulations.map((simulation) =>
      this.mapSimulation(simulation),
    );
  }

  async findRunning(): Promise<Simulation[]> {
    const simulations = await this.db.simulation.findMany({
      where: { status: 'running' },
      include: {
        matches: {
          include: {
            homeTeam: { include: { players: true } },
            awayTeam: { include: { players: true } },
          },
        },
      },
    });
    return simulations.map((sim) => this.mapSimulation(sim));
  }

  async save(simulation: Simulation): Promise<Simulation> {
    await this.db.simulation.update({
      where: { id: simulation.id },
      data: {
        name: simulation.name,
        status: simulation.status,
        startedAt: simulation.startedAt,
        finishedAt: simulation.finishedAt,
        totalGoals: simulation.totalGoals,
      },
    });
    return this.findById(simulation.id);
  }

  async create(simulation: Simulation): Promise<Simulation> {
    await this.db.simulation.create({
      data: {
        id: simulation.id,
        name: simulation.name,
        status: simulation.status,
        startedAt: simulation.startedAt,
        finishedAt: simulation.finishedAt,
        totalGoals: simulation.totalGoals,
      },
    });

    for (const match of simulation.matches) {
      await this.db.match.create({
        data: {
          id: match.id,
          simulationId: simulation.id,
          homeTeamId: match.homeTeam.id,
          awayTeamId: match.awayTeam.id,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
        },
      });
    }

    return this.findById(simulation.id);
  }

  async update(id: string, updates: Partial<Simulation>): Promise<Simulation> {
    await this.db.simulation.update({
      where: { id },
      data: {
        name: updates.name,
        status: updates.status,
        startedAt: updates.startedAt,
        finishedAt: updates.finishedAt,
        totalGoals: updates.totalGoals,
      },
    });
    return this.findById(id);
  }

  async saveMatches(simulationId: string, matches: Match[]): Promise<void> {
    const totalGoals = matches.reduce(
      (sum: number, match: Match) => sum + match.homeScore + match.awayScore,
      0,
    );

    const updates = matches.map((match) =>
      this.prisma.match.update({
        where: { id: match.id },
        data: {
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          status: match.status,
        },
      }),
    );

    const simUpdate = this.prisma.simulation.update({
      where: { id: simulationId },
      data: { totalGoals },
    });

    await this.prisma.$transaction([...updates, simUpdate]);
  }

  async findById(id: string): Promise<Simulation> {
    const simulation = await this.db.simulation.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            homeTeam: { include: { players: true } },
            awayTeam: { include: { players: true } },
          },
        },
      },
    });
    if (!simulation) {
      throw new NotFoundException(`Simulation with id ${id} is not found`);
    }

    return this.mapSimulation(simulation);
  }

  async getLastStartedDate(): Promise<Date | null> {
    const latest = await this.db.simulation.findFirst({
      where: { startedAt: { not: null } },
      orderBy: { startedAt: 'desc' },
      select: { startedAt: true },
    });
    return latest?.startedAt ?? null;
  }

  private get db() {
    return this.prisma;
  }

  private mapSimulation(simulation: SimulationWithMatches): Simulation {
    return {
      id: simulation.id,
      name: simulation.name,
      status: simulation.status as Simulation['status'],
      startedAt: simulation.startedAt,
      finishedAt: simulation.finishedAt,
      totalGoals: simulation.totalGoals,
      matches: simulation.matches.map((match: MatchWithTeams) => ({
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status as Match['status'],
      })),
    };
  }
}
