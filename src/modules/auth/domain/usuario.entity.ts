import { Entity } from '../../../shared/domain/entity.base';
import { DomainException } from '../../../shared/domain/exceptions';

export interface UsuarioProps {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
}

export class Usuario extends Entity {
  private readonly nome: string;
  private readonly email: string;
  private readonly senhaHash: string;

  private constructor(
    id: string,
    nome: string,
    email: string,
    senhaHash: string,
  ) {
    super(id);
    this.nome = nome;
    this.email = email;
    this.senhaHash = senhaHash;
  }

  static criar(props: UsuarioProps): Usuario {
    const email = (props.email ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new DomainException('E-mail de usuário administrativo inválido');
    }
    return new Usuario(props.id, props.nome.trim(), email, props.senhaHash);
  }

  getNome(): string {
    return this.nome;
  }

  getEmail(): string {
    return this.email;
  }

  getSenhaHash(): string {
    return this.senhaHash;
  }
}
