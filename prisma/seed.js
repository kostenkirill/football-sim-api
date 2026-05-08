const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const teams = [
  { id: 'team-1', name: 'Germany', shortName: 'GER', countryCode: 'DE' },
  { id: 'team-2', name: 'Poland', shortName: 'POL', countryCode: 'PL' },
  { id: 'team-3', name: 'Brazil', shortName: 'BRA', countryCode: 'BR' },
  { id: 'team-4', name: 'Mexico', shortName: 'MEX', countryCode: 'MX' },
  { id: 'team-5', name: 'Argentina', shortName: 'ARG', countryCode: 'AR' },
  { id: 'team-6', name: 'Uruguay', shortName: 'URU', countryCode: 'UY' },
  { id: 'team-7', name: 'France', shortName: 'FRA', countryCode: 'FR' },
  { id: 'team-8', name: 'Spain', shortName: 'ESP', countryCode: 'ES' },
];

const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

function buildPlayers() {
  const players = [];
  for (const team of teams) {
    for (let index = 1; index <= 15; index += 1) {
      players.push({
        id: `${team.id}-player-${index}`,
        teamId: team.id,
        firstName: `${team.shortName}First${index}`,
        lastName: `${team.shortName}Last${index}`,
        shirtNumber: index,
        position: positions[(index - 1) % positions.length],
      });
    }
  }
  return players;
}

function buildMatches(simulationId) {
  const matches = [];
  for (let index = 0; index < teams.length; index += 2) {
    matches.push({
      id: `match-seed-${index / 2 + 1}`,
      simulationId,
      homeTeamId: teams[index].id,
      awayTeamId: teams[index + 1].id,
      homeScore: index / 2,
      awayScore: (index / 2) + 1,
      status: 'finished',
    });
  }
  return matches;
}

async function main() {
  await prisma.match.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();

  for (const team of teams) {
    await prisma.team.create({ data: team });
  }

  const players = buildPlayers();
  for (const player of players) {
    await prisma.player.create({ data: player });
  }

  const simulationId = 'sim-seed-1';
  const matches = buildMatches(simulationId);
  const totalGoals = matches.reduce(
    (sum, match) => sum + match.homeScore + match.awayScore,
    0,
  );

  await prisma.simulation.create({
    data: {
      id: simulationId,
      name: 'Seeded Group Stage',
      status: 'completed',
      startedAt: new Date('2026-01-01T12:00:00.000Z'),
      finishedAt: new Date('2026-01-01T12:01:00.000Z'),
      totalGoals,
    },
  });

  for (const match of matches) {
    await prisma.match.create({ data: match });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
