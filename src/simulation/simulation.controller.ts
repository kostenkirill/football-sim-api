import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CooldownGuard } from '../common/guards/cooldown.guard';
import { SimulationService } from './simulation.service';
import { StartSimulationDto } from './dto/start-simulation.dto';

@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.simulationService.get(id);
  }
  @UseGuards(CooldownGuard)
  @Post('start')
  start(@Body() dto: StartSimulationDto) {
    return this.simulationService.start(dto);
  }

  @Patch(':id/finish')
  finish(@Param('id') id: string) {
    return this.simulationService.finish(id);
  }

  @Patch(':id/restart')
  restart(@Param('id') id: string) {
    return this.simulationService.restart(id);
  }
}
