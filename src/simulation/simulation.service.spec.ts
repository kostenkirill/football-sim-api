import { ConflictException } from '@nestjs/common';
import { SimulationStore } from '../common/store/simulation.store';
import { TeamService } from '../team/team.service';
import { TEAMS } from '../team/data/teams.data';
import { Simulation } from './entities/simulation.entity';
import { SimulationService } from './simulation.service';
import { SimulationGateway } from './simulation.gateway';

const mockSimulation: Partial<Simulation> = {
  id: 'sim-1',
  name: 'Qatar 2022',
  matches: [],
  status: 'running',
  startedAt: new Date(),
  finishedAt: null,
  totalGoals: 0,
};

const mockStore: Partial<SimulationStore> = {
  findById: jest.fn().mockResolvedValue(mockSimulation),
  create: jest.fn().mockResolvedValue(mockSimulation),
  save: jest.fn().mockImplementation(async (sim: Simulation) => sim),
  update: jest.fn().mockResolvedValue(mockSimulation),
  saveMatches: jest.fn().mockResolvedValue(undefined),
};
const findByIdMock = mockStore.findById as jest.Mock;

const mockTeamService: Partial<TeamService> = {
  findAll: jest.fn().mockImplementation(() =>
    Promise.resolve(TEAMS.map((team) => ({ ...team, players: [] }))),
  ),
  findById: jest.fn().mockImplementation((id: string) =>
    Promise.resolve(
      TEAMS.find((t) => t.id === id)
        ? { ...TEAMS.find((t) => t.id === id), players: [] }
        : undefined,
    ),
  ),
};

const mockGateway: Partial<SimulationGateway> = {
  emitSimulationStart: jest.fn(),
  emitSimulationFinish: jest.fn(),
  emitScoreUpdate: jest.fn(),
};

describe('SimulationService', () => {
  let service: SimulationService;

  beforeEach(() => {
    jest.clearAllMocks();
    findByIdMock.mockResolvedValue({ ...mockSimulation });
    service = new SimulationService(
      mockStore as SimulationStore,
      mockTeamService as TeamService,
      mockGateway as SimulationGateway,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('get', () => {
    it('should return a simulation by id', async () => {
      const result = await service.get('sim-1');
      expect(result).toMatchObject(mockSimulation);
      expect(mockStore.findById).toHaveBeenCalledWith('sim-1');
    });
  });

  describe('start', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should create and return a running simulation', async () => {
      const result = await service.start({ name: 'Qatar 2022' });
      expect(result.status).toBe('running');
      expect(mockStore.create).toHaveBeenCalled();
      expect(mockGateway.emitSimulationStart).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should finish a running simulation', async () => {
      const result = await service.finish('sim-1');
      expect(result.status).toBe('completed');
      expect(mockGateway.emitSimulationFinish).toHaveBeenCalled();
    });

    it('should throw ConflictException if simulation is not running', async () => {
      findByIdMock.mockResolvedValueOnce({
        ...mockSimulation,
        status: 'completed',
      });
      await expect(service.finish('sim-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('restart', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should throw ConflictException if simulation is not completed', async () => {
      await expect(service.restart('sim-1')).rejects.toThrow(ConflictException);
    });

    it('should restart a completed simulation', async () => {
      findByIdMock.mockResolvedValueOnce({
        ...mockSimulation,
        status: 'completed',
      });
      const result = await service.restart('sim-1');
      expect(result.status).toBe('running');
      expect(mockGateway.emitSimulationStart).toHaveBeenCalled();
    });
  });
});
