import { Module } from '@nestjs/common';
import { SimulationStore } from './store/simulation.store';
import { CooldownGuard } from './guards/cooldown.guard';

@Module({
  providers: [SimulationStore, CooldownGuard],
  exports: [SimulationStore, CooldownGuard],
})
export class CommonModule {}
