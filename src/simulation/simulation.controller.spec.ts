import { Test, TestingModule } from '@nestjs/testing';
import { CooldownGuard } from '../common/guards/cooldown.guard';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';

const mockSimulation = {
  id: 'sim-1',
  name: 'Qatar 2022',
  matches: [],
  status: 'running',
  startedAt: new Date(),
  finishedAt: null,
  totalGoals: 0,
};

const mockSimulationService = {
  get: jest.fn().mockReturnValue(mockSimulation),
  start: jest.fn().mockReturnValue(mockSimulation),
  finish: jest.fn().mockReturnValue({ ...mockSimulation, status: 'completed' }),
  restart: jest.fn().mockReturnValue({ ...mockSimulation, status: 'running' }),
};

describe('SimulationController', () => {
  let controller: SimulationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimulationController],
      providers: [
        { provide: SimulationService, useValue: mockSimulationService },
      ],
    })
      .overrideGuard(CooldownGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SimulationController>(SimulationController);
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should return a simulation', () => {
      expect(controller.get('sim-1')).toEqual(mockSimulation);
      expect(mockSimulationService.get).toHaveBeenCalledWith('sim-1');
    });
  });

  describe('start', () => {
    it('should start a simulation', () => {
      const result = controller.start({ name: 'Qatar 2022' });
      expect(result.status).toBe('running');
      expect(mockSimulationService.start).toHaveBeenCalledWith({
        name: 'Qatar 2022',
      });
    });
  });

  describe('finish', () => {
    it('should finish a simulation', () => {
      const result = controller.finish('sim-1');
      expect(result.status).toBe('completed');
      expect(mockSimulationService.finish).toHaveBeenCalledWith('sim-1');
    });
  });

  describe('restart', () => {
    it('should restart a simulation', () => {
      const result = controller.restart('sim-1');
      expect(result.status).toBe('running');
      expect(mockSimulationService.restart).toHaveBeenCalledWith('sim-1');
    });
  });
});
