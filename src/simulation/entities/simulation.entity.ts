import { Match } from '../../match/entities/match.entity';

type SimulationStatus = 'pending' | 'running' | 'completed';

export interface Simulation {
  id: string;
  name: string;
  matches: Match[];
  status: SimulationStatus;
  startedAt: Date | null;
  finishedAt: Date | null;
  totalGoals: number;
}
