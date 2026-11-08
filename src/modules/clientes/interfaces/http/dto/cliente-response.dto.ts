import { ApiProperty } from '@nestjs/swagger';
import { Cliente } from '../../../domain/cliente.entity';

export class ClienteResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  documento: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  telefone: string;

  static fromDomain(cliente: Cliente): ClienteResponseDto {
    const dto = new ClienteResponseDto();
    dto.id = cliente.id;
    dto.nome = cliente.getNome();
    dto.documento = cliente.getDocumento().formatado();
    dto.email = cliente.getEmail();
    dto.telefone = cliente.getTelefone();
    return dto;
  }
}
