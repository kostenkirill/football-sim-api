import { Module } from '@nestjs/common';
import { SimulationStore } from './store/simulation.store';

@Module({
  providers: [SimulationStore],
  exports: [SimulationStore],
})
export class CommonModule {}
