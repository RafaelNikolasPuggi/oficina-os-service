import { Entity } from '../../../shared/domain/entity.base';
import { CpfCnpj } from '../../../shared/domain/cpf-cnpj.vo';
import { DomainException } from '../../../shared/domain/exceptions';

export interface ClienteProps {
  id: string;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
}

export class Cliente extends Entity {
  private nome: string;
  private readonly documento: CpfCnpj;
  private email: string;
  private telefone: string;

  private constructor(
    id: string,
    nome: string,
    documento: CpfCnpj,
    email: string,
    telefone: string,
  ) {
    super(id);
    this.nome = nome;
    this.documento = documento;
    this.email = email;
    this.telefone = telefone;
  }

  static criar(props: ClienteProps): Cliente {
    const nome = (props.nome ?? '').trim();
    if (nome.length < 3) {
      throw new DomainException(
        'Nome do cliente deve ter ao menos 3 caracteres',
      );
    }

    const documento = CpfCnpj.criar(props.documento);

    return new Cliente(
      props.id,
      nome,
      documento,
      props.email?.trim() ?? '',
      props.telefone?.trim() ?? '',
    );
  }

  atualizar(dados: { nome?: string; email?: string; telefone?: string }): void {
    if (dados.nome !== undefined) {
      const nome = dados.nome.trim();
      if (nome.length < 3) {
        throw new DomainException(
          'Nome do cliente deve ter ao menos 3 caracteres',
        );
      }
      this.nome = nome;
    }
    if (dados.email !== undefined) this.email = dados.email.trim();
    if (dados.telefone !== undefined) this.telefone = dados.telefone.trim();
  }

  getNome(): string {
    return this.nome;
  }

  getDocumento(): CpfCnpj {
    return this.documento;
  }

  getEmail(): string {
    return this.email;
  }

  getTelefone(): string {
    return this.telefone;
  }
}
