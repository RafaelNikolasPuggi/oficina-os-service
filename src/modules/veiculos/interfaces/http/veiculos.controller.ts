import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../../../../shared/dto/pagination.dto';
import { VeiculosService } from '../../application/veiculos.service';
import { CreateVeiculoDto } from './dto/create-veiculo.dto';
import { UpdateVeiculoDto } from './dto/update-veiculo.dto';
import { VeiculoResponseDto } from './dto/veiculo-response.dto';

@ApiTags('Veículos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um veículo vinculado a um cliente' })
  async criar(@Body() dto: CreateVeiculoDto): Promise<VeiculoResponseDto> {
    const veiculo = await this.veiculosService.criar(dto);
    return VeiculoResponseDto.fromDomain(veiculo);
  }

  @Get()
  @ApiOperation({ summary: 'Lista veículos de forma paginada' })
  async listar(@Query() query: PaginationQueryDto) {
    const resultado = await this.veiculosService.listar(
      query.page,
      query.limit,
    );
    return {
      ...resultado,
      items: resultado.items.map((item) => VeiculoResponseDto.fromDomain(item)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um veículo pelo id' })
  async obter(@Param('id') id: string): Promise<VeiculoResponseDto> {
    const veiculo = await this.veiculosService.obter(id);
    return VeiculoResponseDto.fromDomain(veiculo);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de um veículo' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateVeiculoDto,
  ): Promise<VeiculoResponseDto> {
    const veiculo = await this.veiculosService.atualizar(id, dto);
    return VeiculoResponseDto.fromDomain(veiculo);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um veículo' })
  async remover(@Param('id') id: string): Promise<void> {
    await this.veiculosService.remover(id);
  }
}
