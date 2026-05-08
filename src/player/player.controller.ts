import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@ApiTags('players')
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: 'Get all players' })
  @Get()
  findAll() {
    return this.playerService.findAll();
  }

  @ApiOperation({ summary: 'Get players by team id' })
  @ApiParam({ name: 'teamId', description: 'Team id' })
  @Get('team/:teamId')
  findByTeamId(@Param('teamId') teamId: string) {
    return this.playerService.findByTeamId(teamId);
  }

  @ApiOperation({ summary: 'Get a player by id' })
  @ApiParam({ name: 'id', description: 'Player id' })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.playerService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new player' })
  @Post()
  create(@Body() dto: CreatePlayerDto) {
    return this.playerService.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing player' })
  @ApiParam({ name: 'id', description: 'Player id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlayerDto) {
    return this.playerService.update(id, dto);
  }
}
