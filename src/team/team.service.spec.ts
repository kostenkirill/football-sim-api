import { NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { TEAMS } from './data/teams.data';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamService', () => {
  let service: TeamService;
  const prismaMock = {
    team: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  beforeEach(() => {
    jest.clearAllMocks();
    (prismaMock.team.findMany as jest.Mock).mockResolvedValue(
      TEAMS.map((team) => ({ ...team, players: [] })),
    );
    (prismaMock.team.findUnique as jest.Mock).mockImplementation(({ where }) =>
      Promise.resolve(
        TEAMS.find((team) => team.id === where.id)
          ? { ...TEAMS.find((team) => team.id === where.id), players: [] }
          : null,
      ),
    );
    service = new TeamService(prismaMock);
  });

  describe('findAll', () => {
    it('should return all teams', async () => {
      await expect(service.findAll()).resolves.toEqual(
        TEAMS.map((team) => ({ ...team, players: [] })),
      );
    });
  });

  describe('findById', () => {
    it('should return a team by id', async () => {
      await expect(service.findById('team-1')).resolves.toEqual({
        ...TEAMS[0],
        players: [],
      });
    });

    it('should throw NotFoundException if team is not found', async () => {
      await expect(service.findById('team-10')).rejects.toThrow(NotFoundException);
    });
  });
});
