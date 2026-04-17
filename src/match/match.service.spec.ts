import { ConflictException } from '@nestjs/common';
import { TeamService } from '../team/team.service';
import { TEAMS } from '../team/data/teams.data';
import { MatchService } from './match.service';
import { TeamSide } from './entities/match.entity';

const mockTeamService: Partial<TeamService> = {
  findById: jest
    .fn()
    .mockImplementation((id: string) => TEAMS.find((t) => t.id === id)),
};

describe('MatchService', () => {
  let service: MatchService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MatchService();
    service.createMatch('team-1', 'team-2', mockTeamService as TeamService);
  });

  describe('createMatch', () => {
    it('should create a match with correct teams', () => {
      const match = service.get();
      expect(match.homeTeam.id).toBe('team-1');
      expect(match.awayTeam.id).toBe('team-2');
      expect(match.homeScore).toBe(0);
      expect(match.awayScore).toBe(0);
      expect(match.status).toBe('scheduled');
    });
  });

  describe('start', () => {
    it('should set match status to live', () => {
      service.start();
      expect(service.get().status).toBe('live');
    });
  });

  describe('stop', () => {
    it('should set match status to finished', () => {
      service.start();
      service.stop();
      expect(service.get().status).toBe('finished');
    });

    it('should throw ConflictException if match is not live', () => {
      expect(() => service.stop()).toThrow(ConflictException);
    });
  });

  describe('reset', () => {
    it('should reset scores and status', () => {
      service.start();
      service.scoreGoal(TeamSide.HOME);
      service.scoreGoal(TeamSide.AWAY);
      service.stop();
      service.reset();
      const match = service.get();
      expect(match.homeScore).toBe(0);
      expect(match.awayScore).toBe(0);
      expect(match.status).toBe('scheduled');
    });
  });

  describe('scoreGoal', () => {
    beforeEach(() => service.start());

    it('should increment home score', () => {
      service.scoreGoal(TeamSide.HOME);
      expect(service.get().homeScore).toBe(1);
    });

    it('should increment away score', () => {
      service.scoreGoal(TeamSide.AWAY);
      expect(service.get().awayScore).toBe(1);
    });

    it('should throw ConflictException if match is not live', () => {
      service.stop();
      expect(() => service.scoreGoal(TeamSide.HOME)).toThrow(ConflictException);
    });
  });
});
