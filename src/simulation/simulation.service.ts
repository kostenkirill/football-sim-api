import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { TeamSide, Match } from '../match/entities/match.entity';
import { MatchService } from '../match/match.service';
import { SimulationStore } from '../common/store/simulation.store';
import { TeamService } from '../team/team.service';
import { Simulation } from './entities/simulation.entity';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { SIMULATION_DURATION_MS, SIMULATION_TICK } from './data/constants';
import { SimulationGateway } from './simulation.gateway';
import { generateId } from '../common/shared/utils';

@Injectable()
export class SimulationService {
  constructor(
    private readonly simulationStore: SimulationStore,
    private readonly teamService: TeamService,
    private readonly gateway: SimulationGateway,
    private readonly matchService: MatchService,
  ) {}

  async getAll(): Promise<Simulation[]> {
    return this.simulationStore.findAll();
  }

  async get(id: string): Promise<Simulation> {
    return this.simulationStore.findById(id);
  }

  async start(dto: StartSimulationDto): Promise<Simulation> {
    const teams = await this.teamService.findAll();
    const matches: Match[] = [];

    for (let index = 0; index < teams.length - 1; index += 2) {
      const homeTeam = teams[index];
      const awayTeam = teams[index + 1];
      if (!homeTeam || !awayTeam) continue;

      const match = this.matchService.createMatch(homeTeam, awayTeam);
      matches.push(match);
    }

    if (!matches.length) {
      throw new BadRequestException(
        'Not enough teams available to create simulation matchups.',
      );
    }

    matches.forEach((m) => this.matchService.start(m));

    const simulation = await this.simulationStore.create({
      id: generateId('sim'),
      name: dto.name,
      matches,
      status: 'running',
      startedAt: new Date(),
      finishedAt: null,
      totalGoals: 0,
    });

    Logger.log(`Simulation started: ${simulation.name} (ID: ${simulation.id})`);
    this.gateway.emitSimulationStart(simulation);
    return simulation;
  }

  async finish(id: string): Promise<Simulation> {
    const simulation = await this.get(id);
    if (simulation.status !== 'running')
      throw new ConflictException('Simulation is not running');

    const matches = simulation.matches;
    matches.forEach((m) => this.matchService.stop(m));
    
    simulation.status = 'completed';
    simulation.finishedAt = new Date();
    Logger.log(
      `Simulation ${simulation.name} (ID: ${simulation.id}) finished at ${simulation.finishedAt.toISOString()}`,
    );
    this.gateway.emitSimulationFinish(simulation);
    
    simulation.totalGoals = matches.reduce((sum, match) => sum + match.homeScore + match.awayScore, 0);
    await this.simulationStore.saveMatches(id, matches);
    return this.simulationStore.save(simulation);
  }

  async restart(id: string): Promise<Simulation> {
    const simulation = await this.get(id);
    if (simulation.status !== 'completed')
      throw new ConflictException(
        'Simulation is not finished yet and cannot be restarted',
      );

    const matches = simulation.matches;

    matches.forEach((m) => {
      this.matchService.reset(m);
      this.matchService.start(m);
    });

    simulation.matches = matches;
    simulation.status = 'running';
    simulation.startedAt = new Date();
    simulation.finishedAt = null;
    simulation.totalGoals = 0;

    await this.simulationStore.save(simulation);
    await this.simulationStore.saveMatches(id, matches);
    this.gateway.emitSimulationStart(simulation);
    return simulation;
  }

  @Interval(SIMULATION_TICK)
  async handleSimulationTick(): Promise<void> {
    try {
      const runningSims = await this.simulationStore.findRunning();
      for (const sim of runningSims) {
        if (!sim.startedAt) continue;

        const elapsed = new Date().getTime() - sim.startedAt.getTime();
        if (elapsed >= SIMULATION_DURATION_MS) {
          await this.finish(sim.id);
          continue;
        }

        const allTeams = sim.matches.flatMap((m) => [
          { team: m.homeTeam, side: TeamSide.HOME, match: m },
          { team: m.awayTeam, side: TeamSide.AWAY, match: m },
        ]);
        const randomTeam = allTeams[Math.floor(Math.random() * allTeams.length)];
        if (!randomTeam) continue;

        const match = this.matchService.scoreGoal(randomTeam.match, randomTeam.side);
        
        await this.simulationStore.saveMatches(sim.id, sim.matches);
        this.gateway.emitScoreUpdate(sim, match);
      }
    } catch (error) {
      Logger.error(`Error in simulation tick`, error);
    }
  }
}
