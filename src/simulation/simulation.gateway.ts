import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Match } from '../match/entities/match.entity';
import { Simulation } from './entities/simulation.entity';

@WebSocketGateway({ cors: true })
export class SimulationGateway {
  @WebSocketServer()
  server!: Server;

  emitSimulationStart(simulation: Simulation): void {
    this.server.emit(`simulation:start`, simulation);
  }
  emitScoreUpdate(simulation: Simulation, match: Match): void {
    this.server.emit(`simulation:score-update`, {
      simulationId: simulation.id,
      ...match,
    });
  }
  emitSimulationFinish(simulation: Simulation): void {
    this.server.emit(`simulation:finish`, simulation);
  }
}
