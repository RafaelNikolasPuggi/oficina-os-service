import { ApiProperty } from '@nestjs/swagger';
import { Veiculo } from '../../../domain/veiculo.entity';

export class VeiculoResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clienteId: string;

  @ApiProperty()
  placa: string;

  @ApiProperty()
  marca: string;

  @ApiProperty()
  modelo: string;

  @ApiProperty()
  ano: number;

  static fromDomain(veiculo: Veiculo): VeiculoResponseDto {
    const dto = new VeiculoResponseDto();
    dto.id = veiculo.id;
    dto.clienteId = veiculo.getClienteId();
    dto.placa = veiculo.getPlaca().getValor();
    dto.marca = veiculo.getMarca();
    dto.modelo = veiculo.getModelo();
    dto.ano = veiculo.getAno();
    return dto;
  }
}
