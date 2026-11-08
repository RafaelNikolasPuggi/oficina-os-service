import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ClienteAtual } from '../../../auth/decorators/cliente-atual.decorator';
import { ClienteAuthGuard } from '../../../auth/guards/cliente-auth.guard';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  OrdensServicoService,
  TempoMedioExecucao,
} from '../../application/ordens-servico.service';
import { AprovacaoOrcamentoDto } from './dto/aprovacao-orcamento.dto';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { ListarOrdensServicoQueryDto } from './dto/listar-ordens-servico-query.dto';
import { OrdemServicoResponseDto } from './dto/ordem-servico-response.dto';
import { RegistrarDiagnosticoDto } from './dto/registrar-diagnostico.dto';

@ApiTags('Ordens de Serviço')
@Controller('ordens-servico')
export class OrdensServicoController {
  constructor(private readonly ordensServicoService: OrdensServicoService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '[Admin] Abre uma nova Ordem de Serviço' })
  async abrir(
    @Body() dto: CreateOrdemServicoDto,
  ): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.abrir({
      clienteId: dto.clienteId,
      veiculoId: dto.veiculoId,
      servicos: dto.servicos,
      pecas: dto.pecas,
    });
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[Admin] Lista e filtra as Ordens de Serviço',
    description:
      'Sem o parâmetro "status": aplica a listagem operacional padrão — oculta OS ' +
      'finalizadas/entregues (exclusão lógica) e ordena por prioridade (Em Execução > ' +
      'Aguardando Aprovação > Em Diagnóstico > Recebida, mais antigas primeiro). ' +
      'Com "status" informado: filtra exatamente por esse status (permite consultar o ' +
      'histórico de OS finalizadas/entregues), ordenado pelas mais antigas primeiro.',
  })
  async listar(@Query() query: ListarOrdensServicoQueryDto) {
    const resultado = await this.ordensServicoService.listar({
      status: query.status,
      page: query.page,
      limit: query.limit,
    });
    return {
      ...resultado,
      items: resultado.items.map((item) =>
        OrdemServicoResponseDto.fromDomain(item),
      ),
    };
  }

  @Get('metricas/tempo-medio')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[Admin] Tempo médio de execução das OS finalizadas',
  })
  async tempoMedioExecucao(): Promise<TempoMedioExecucao> {
    return this.ordensServicoService.tempoMedioExecucao();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[Admin] Detalhamento completo de uma Ordem de Serviço',
  })
  async obter(@Param('id') id: string): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.obter(id);
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Patch(':id/iniciar-diagnostico')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[Admin] Inicia o diagnóstico técnico da Ordem de Serviço',
  })
  async iniciarDiagnostico(
    @Param('id') id: string,
  ): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.iniciarDiagnostico(id);
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Patch(':id/diagnostico')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      '[Admin] Registra o diagnóstico, atualiza o orçamento e envia para aprovação',
  })
  async registrarDiagnostico(
    @Param('id') id: string,
    @Body() dto: RegistrarDiagnosticoDto,
  ): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.registrarDiagnostico(
      id,
      dto,
    );
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Patch(':id/finalizar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '[Admin] Finaliza a execução da Ordem de Serviço' })
  async finalizar(@Param('id') id: string): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.finalizar(id);
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Patch(':id/entregar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '[Admin] Marca a Ordem de Serviço como entregue ao cliente',
  })
  async entregar(@Param('id') id: string): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.entregar(id);
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Get(':id/status')
  @ApiBearerAuth()
  @UseGuards(ClienteAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiOperation({
    summary: '[Cliente] Consulta o status da OS',
    description:
      'Requer o JWT emitido pela Lambda de autenticação por CPF (repositório ' +
      'oficina-lambda-auth, Fase 3) — POST {api_endpoint}/auth/cliente.',
  })
  async consultarStatus(
    @Param('id') id: string,
    @ClienteAtual() clienteId: string,
  ): Promise<OrdemServicoResponseDto> {
    const ordemServico = await this.ordensServicoService.consultarStatus(
      id,
      clienteId,
    );
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }

  @Post(':id/aprovacao')
  @ApiBearerAuth()
  @UseGuards(ClienteAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({
    summary: '[Cliente] Aprova ou recusa o orçamento gerado no diagnóstico',
    description:
      'Requer o JWT emitido pela Lambda de autenticação por CPF (repositório ' +
      'oficina-lambda-auth, Fase 3) — POST {api_endpoint}/auth/cliente.',
  })
  async decidirOrcamento(
    @Param('id') id: string,
    @ClienteAtual() clienteId: string,
    @Body() dto: AprovacaoOrcamentoDto,
  ): Promise<OrdemServicoResponseDto> {
    const ordemServico = dto.aprovado
      ? await this.ordensServicoService.aprovarOrcamento(id, clienteId)
      : await this.ordensServicoService.recusarOrcamento(id, clienteId);
    return OrdemServicoResponseDto.fromDomain(ordemServico);
  }
}
