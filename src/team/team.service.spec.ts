import { NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { TEAMS } from './data/teams.data';

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    service = new TeamService();
  });

  describe('findAll', () => {
    it('should return all teams', () => {
      expect(service.findAll()).toEqual(TEAMS);
    });
  });

  describe('findById', () => {
    it('should return a team by id', () => {
      expect(service.findById('team-1')).toEqual(TEAMS[0]);
    });

    it('should throw NotFoundException if team is not found', () => {
      expect(() => service.findById('team-10')).toThrow(NotFoundException);
    });
  });
});
