import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Post,
  UseGuards,
  Req,
  Res,
  Request,
} from '@nestjs/common';
import { SchoolService } from './schools.service';
import { UpdateSchoolDto } from './dto/update-schools.dto';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListSchoolDto } from './dto/list-schools.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { MintQueueDto, MintQueueSingleDto } from './dto/mint-queue.dto';
import { MintStatus } from '@prisma/application';
import fastify = require('fastify');
@Controller('schools')
@ApiTags('School')
export class SchoolController {
  constructor(private readonly schoolService: SchoolService) {}

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Get('onchainDataQueue')
  queue() {
    return this.schoolService.queueOnchainData(1);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('mintBulk')
  mintBatchSchool(@Body() MintData: MintQueueDto) {
    return this.schoolService.checkAdminandMintQueue(MintData);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('mintSchool')
  mintSchool(@Body() MintData: MintQueueSingleDto) {
    return this.schoolService.checkAdminandSingleMintQueue(MintData);
  }

  @Public()
  @ApiQuery({ name: 'minted', enum: MintStatus, required: false })
  @Get('schoolCount')
  countSchools(@Query('minted') minted: MintStatus) {
    const query: ListSchoolDto = {
      minted,
    };
    return this.schoolService.countSchools(query);
  }

  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post('/uploadFile')
  async uploadFile(
    @Req() req: fastify.FastifyRequest,
    @Res() res: fastify.FastifyReply<any>,
    @Request() request: any,
  ): Promise<any> {
    return await this.schoolService.uploadFile(req, res, request.user);
  }

  @Public()
  @Get()
  findAll(@Query() query: ListSchoolDto) {
    return this.schoolService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.schoolService.findOne(`${id}`);
  }

  @Public()
  @Get('byCountry/:country')
  findByCountry(@Param('country') country: string) {
    return this.schoolService.byCountry(`${country}`);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
    return this.schoolService.update(+id, updateSchoolDto);
  }

  @Delete()
  removeAll() {
    return this.schoolService.removeAll();
  }
}
