import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SimulationStore } from '../store/simulation.store';
import { SIMULATION_COOLDOWN_MS } from '../../simulation/data/constants';

@Injectable()
export class CooldownGuard implements CanActivate {
  constructor(private readonly store: SimulationStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const lastStartedDate = await this.store.getLastStartedDate();
    if (
      lastStartedDate &&
      Date.now() - lastStartedDate.getTime() < SIMULATION_COOLDOWN_MS
    ) {
      throw new HttpException(
        `Too many requests. The interval between simulations must be at least ${SIMULATION_COOLDOWN_MS / 1000} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
