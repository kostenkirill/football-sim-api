import { ConflictException } from '@nestjs/common';
import { SimulationStore } from '../common/store/simulation.store';
import { TeamService } from '../team/team.service';
import { TEAMS } from '../team/data/teams.data';
import { MATCHUPS } from '../match/data/match.data';
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
  findById: jest.fn().mockReturnValue(mockSimulation),
  create: jest.fn().mockReturnValue(mockSimulation),
  save: jest.fn().mockImplementation((sim: Simulation) => sim),
  update: jest.fn(),
  setLastStartedDate: jest.fn(),
  getTotalGoals: jest.fn().mockReturnValue(0),
};
const findByIdMock = mockStore.findById as jest.Mock;

const mockTeamService: Partial<TeamService> = {
  findById: jest
    .fn()
    .mockImplementation((id: string) => TEAMS.find((t) => t.id === id)),
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
    findByIdMock.mockReturnValue({ ...mockSimulation });
    service = new SimulationService(
      MATCHUPS,
      mockStore as SimulationStore,
      mockTeamService as TeamService,
      mockGateway as SimulationGateway,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('get', () => {
    it('should return a simulation by id', () => {
      const result = service.get('sim-1');
      expect(result).toEqual(mockSimulation);
      expect(mockStore.findById).toHaveBeenCalledWith('sim-1');
    });
  });

  describe('start', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should create and return a running simulation', () => {
      const result = service.start({ name: 'Qatar 2022' });
      expect(result.status).toBe('running');
      expect(mockStore.create).toHaveBeenCalled();
      expect(mockGateway.emitSimulationStart).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should finish a running simulation', () => {
      const result = service.finish('sim-1');
      expect(result.status).toBe('completed');
      expect(mockGateway.emitSimulationFinish).toHaveBeenCalled();
    });

    it('should throw ConflictException if simulation is not running', () => {
      findByIdMock.mockReturnValueOnce({
        ...mockSimulation,
        status: 'completed',
      });
      expect(() => service.finish('sim-1')).toThrow(ConflictException);
    });
  });

  describe('restart', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    it('should throw ConflictException if simulation is not completed', () => {
      expect(() => service.restart('sim-1')).toThrow(ConflictException);
    });

    it('should restart a completed simulation', () => {
      findByIdMock.mockReturnValueOnce({
        ...mockSimulation,
        status: 'completed',
      });
      const result = service.restart('sim-1');
      expect(result.status).toBe('running');
      expect(mockGateway.emitSimulationStart).toHaveBeenCalled();
    });
  });
});
