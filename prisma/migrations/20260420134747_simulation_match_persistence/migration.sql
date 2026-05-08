-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME,
    "finishedAt" DATETIME,
    "totalGoals" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "simulationId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    CONSTRAINT "Match_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "Simulation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Simulation_startedAt_idx" ON "Simulation"("startedAt");

-- CreateIndex
CREATE INDEX "Match_simulationId_idx" ON "Match"("simulationId");
