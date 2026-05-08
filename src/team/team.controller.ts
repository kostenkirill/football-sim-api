import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@ApiTags('teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @ApiOperation({ summary: 'Get all teams with players' })
  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @ApiOperation({ summary: 'Get a team by id' })
  @ApiParam({ name: 'id', description: 'Team id' })
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.teamService.findById(id);
  }

  @ApiOperation({ summary: 'Create a new team' })
  @Post()
  create(@Body() dto: CreateTeamDto) {
    return this.teamService.create(dto);
  }

  @ApiOperation({ summary: 'Update an existing team' })
  @ApiParam({ name: 'id', description: 'Team id' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamService.update(id, dto);
  }
}
