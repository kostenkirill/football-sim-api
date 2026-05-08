import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { TeamModule } from '../team/team.module';
import { MatchModule } from '../match/match.module';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { SimulationGateway } from './simulation.gateway';

@Module({
  imports: [CommonModule, TeamModule, MatchModule],
  controllers: [SimulationController],
  providers: [SimulationService, SimulationGateway],
  exports: [SimulationService],
})
export class SimulationModule {}
