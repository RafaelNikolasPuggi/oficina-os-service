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
import { ClientesService } from '../../application/clientes.service';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@ApiTags('Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo cliente' })
  async criar(@Body() dto: CreateClienteDto): Promise<ClienteResponseDto> {
    const cliente = await this.clientesService.criar(dto);
    return ClienteResponseDto.fromDomain(cliente);
  }

  @Get()
  @ApiOperation({ summary: 'Lista clientes de forma paginada' })
  async listar(@Query() query: PaginationQueryDto) {
    const resultado = await this.clientesService.listar(
      query.page,
      query.limit,
    );
    return {
      ...resultado,
      items: resultado.items.map((item) => ClienteResponseDto.fromDomain(item)),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta um cliente pelo id' })
  async obter(@Param('id') id: string): Promise<ClienteResponseDto> {
    const cliente = await this.clientesService.obter(id);
    return ClienteResponseDto.fromDomain(cliente);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados cadastrais de um cliente' })
  async atualizar(
    @Param('id') id: string,
    @Body() dto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    const cliente = await this.clientesService.atualizar(id, dto);
    return ClienteResponseDto.fromDomain(cliente);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um cliente' })
  async remover(@Param('id') id: string): Promise<void> {
    await this.clientesService.remover(id);
  }
}
