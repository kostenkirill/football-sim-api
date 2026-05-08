import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SimulationModule } from './simulation/simulation.module';
import { MatchModule } from './match/match.module';
import { TeamModule } from './team/team.module';
import { CommonModule } from './common/common.module';
import { PlayerModule } from './player/player.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    SimulationModule,
    MatchModule,
    TeamModule,
    PlayerModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
