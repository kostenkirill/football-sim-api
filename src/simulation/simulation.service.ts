import {
  Injectable,
  Inject,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { MatchUp, TeamSide } from '../match/entities/match.entity';
import { MatchService } from '../match/match.service';
import { SimulationStore } from '../common/store/simulation.store';
import { TeamService } from '../team/team.service';
import { Simulation } from './entities/simulation.entity';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { SIMULATION_DURATION_MS, SIMULATION_TICK } from './data/constants';
import { SimulationGateway } from './simulation.gateway';

@Injectable()
export class SimulationService {
  private matchServicesMap = new Map<string, MatchService[]>();
  private timers = new Map<string, NodeJS.Timeout>();
  constructor(
    @Inject('MATCHUPS') private readonly matchUps: MatchUp[],
    private readonly simulationStore: SimulationStore,
    private readonly teamService: TeamService,
    private readonly gateway: SimulationGateway,
  ) {}
  get(id: string): Simulation {
    return this.simulationStore.findById(id);
  }
  start(dto: StartSimulationDto): Simulation {
    const matchServices = this.matchUps.map((m: MatchUp) => {
      const ms = new MatchService();
      ms.createMatch(m.homeTeam.id, m.awayTeam.id, this.teamService);
      return ms;
    });
    const simulation = this.simulationStore.create({
      name: dto.name,
      matches: matchServices.map((ms) => ms.get()),
      status: 'running',
      startedAt: new Date(),
      finishedAt: null,
      totalGoals: 0,
    });
    matchServices.forEach((ms) => ms.start());
    this.matchServicesMap.set(simulation.id, matchServices);
    this.simulationStore.setLastStartedDate(simulation.startedAt!);
    this.scheduleGoals(simulation.id);
    Logger.log(`Simulation started: ${simulation.name} (ID: ${simulation.id})`);
    this.gateway.emitSimulationStart(simulation);
    return simulation;
  }

  finish(id: string): Simulation {
    const simulation = this.get(id);
    if (simulation.status !== 'running')
      throw new ConflictException('Simulation is not running');

    this.clearTimer(id);
    this.matchServicesMap.get(id)?.forEach((ms) => ms.stop());
    simulation.status = 'completed';
    simulation.finishedAt = new Date();
    Logger.log(
      `Simulation ${simulation.name} (ID: ${simulation.id}) finished at ${simulation.finishedAt.toISOString()}`,
    );
    this.gateway.emitSimulationFinish(simulation);
    return this.simulationStore.save(simulation);
  }

  restart(id: string): Simulation {
    const simulation = this.get(id);
    if (simulation.status !== 'completed')
      throw new ConflictException(
        'Simulation is not finished yet and cannot be restarted',
      );

    this.clearTimer(id);

    const matchServices = this.matchServicesMap.get(id) ?? [];

    matchServices.forEach((ms) => {
      ms.reset();
      ms.start();
    });

    simulation.matches = matchServices.map((ms) => ms.get());
    simulation.status = 'running';
    simulation.startedAt = new Date();
    simulation.finishedAt = null;
    simulation.totalGoals = 0;

    this.matchServicesMap.set(id, matchServices);
    this.simulationStore.setLastStartedDate(simulation.startedAt);
    this.simulationStore.save(simulation);
    this.scheduleGoals(id);
    this.gateway.emitSimulationStart(simulation);
    return simulation;
  }

  private scheduleGoals(simulationId: string): void {
    let ticks = 0;
    const timer = setInterval(() => {
      ticks++;
      if (ticks > SIMULATION_DURATION_MS / SIMULATION_TICK) return;
      const matchServices = this.matchServicesMap.get(simulationId) ?? [];
      const allTeams = matchServices.flatMap((ms) => [
        { team: ms.get().homeTeam, side: TeamSide.HOME, ms },
        { team: ms.get().awayTeam, side: TeamSide.AWAY, ms },
      ]);
      const randomTeam = allTeams[Math.floor(Math.random() * allTeams.length)];
      if (!randomTeam)
        throw new BadRequestException(
          'Could not score. No teams are available.',
        );
      const match = randomTeam.ms.scoreGoal(randomTeam.side);

      this.gateway.emitScoreUpdate(this.get(simulationId), match);
      this.simulationStore.update(simulationId, {
        totalGoals: this.simulationStore.getTotalGoals(simulationId) + 1,
      });
      if (ticks === SIMULATION_DURATION_MS / SIMULATION_TICK) {
        this.finish(simulationId);
      }
    }, SIMULATION_TICK);
    this.timers.set(simulationId, timer);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }
}
