import { ApiProperty } from '@nestjs/swagger';
import { OrdemServico } from '../../../domain/ordem-servico.entity';
import { StatusOrdemServico } from '../../../domain/status-ordem-servico.enum';

export class OrdemServicoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clienteId: string;

  @ApiProperty()
  veiculoId: string;

  @ApiProperty({ enum: StatusOrdemServico })
  status: StatusOrdemServico;

  @ApiProperty()
  servicos: {
    servicoId: string;
    nome: string;
    precoUnitario: number;
    quantidade: number;
  }[];

  @ApiProperty()
  pecas: {
    pecaId: string;
    nome: string;
    precoUnitario: number;
    quantidade: number;
  }[];

  @ApiProperty({ nullable: true })
  observacaoDiagnostico: string | null;

  @ApiProperty()
  valorTotal: number;

  @ApiProperty()
  dataRecebimento: Date;

  @ApiProperty({ nullable: true })
  dataDiagnostico: Date | null;

  @ApiProperty({ nullable: true })
  dataAprovacao: Date | null;

  @ApiProperty({ nullable: true })
  dataInicioExecucao: Date | null;

  @ApiProperty({ nullable: true })
  dataFinalizacao: Date | null;

  @ApiProperty({ nullable: true })
  dataEntrega: Date | null;

  static fromDomain(os: OrdemServico): OrdemServicoResponseDto {
    const dto = new OrdemServicoResponseDto();
    dto.id = os.id;
    dto.clienteId = os.getClienteId();
    dto.veiculoId = os.getVeiculoId();
    dto.status = os.getStatus();
    dto.servicos = [...os.getItensServico()];
    dto.pecas = [...os.getItensPeca()];
    dto.observacaoDiagnostico = os.getObservacaoDiagnostico();
    dto.valorTotal = os.getValorTotal();
    dto.dataRecebimento = os.getDataRecebimento();
    dto.dataDiagnostico = os.getDataDiagnostico();
    dto.dataAprovacao = os.getDataAprovacao();
    dto.dataInicioExecucao = os.getDataInicioExecucao();
    dto.dataFinalizacao = os.getDataFinalizacao();
    dto.dataEntrega = os.getDataEntrega();
    return dto;
  }
}
