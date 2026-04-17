import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './simulation/simulation.module';
import { MatchModule } from './match/match.module';
import { TeamModule } from './team/team.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [SimulationModule, MatchModule, TeamModule, CommonModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
