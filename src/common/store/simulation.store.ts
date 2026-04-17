import { Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { Simulation } from '../../simulation/entities/simulation.entity';
import { generateId } from '../shared/utils';

@Injectable()
export class SimulationStore {
  private simulations = new Map<string, Simulation>();
  private lastStartedDate: Date | null = null;

  save(simulation: Simulation): Simulation {
    this.simulations.set(simulation.id, simulation);
    return simulation;
  }
  create(simulation: Omit<Simulation, 'id'>): Simulation {
    const newSimulation: Simulation = {
      id: generateId(`sim`),
      ...simulation,
    };
    return this.save(newSimulation);
  }
  update(id: string, updates: Partial<Simulation>): Simulation {
    const simulation = this.findById(id);
    return this.save({ ...simulation, ...updates });
  }
  findById(id: string): Simulation {
    const simulation = this.simulations.get(id);
    if (!simulation)
      throw new NotFoundException(`Simulation with id ${id} is not found`);
    return simulation;
  }
  getLastStartedDate(): Date | null {
    return this.lastStartedDate;
  }
  setLastStartedDate(date: Date): void {
    this.lastStartedDate = date;
  }

  getTotalGoals(id: string) {
    const simulation = this.findById(id);
    return simulation.totalGoals;
  }
}
