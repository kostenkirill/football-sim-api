import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { TeamModule } from '../team/team.module';
import { MATCHUPS } from '../match/data/match.data';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SimulationGateway } from './simulation.gateway';

@Module({
  imports: [CommonModule, TeamModule],
  controllers: [SimulationController],
  providers: [
    SimulationService,
    SimulationGateway,
    { provide: 'MATCHUPS', useValue: MATCHUPS },
  ],
  exports: [SimulationService],
})
export class SimulationModule {}
