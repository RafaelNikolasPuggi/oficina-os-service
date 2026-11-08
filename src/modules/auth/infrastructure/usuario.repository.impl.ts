import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../domain/usuario.entity';
import { UsuarioRepository } from '../domain/usuario.repository';
import { UsuarioOrmEntity } from './usuario.orm-entity';

@Injectable()
export class TypeOrmUsuarioRepository implements UsuarioRepository {
  constructor(
    @InjectRepository(UsuarioOrmEntity)
    private readonly repo: Repository<UsuarioOrmEntity>,
  ) {}

  async salvar(usuario: Usuario): Promise<Usuario> {
    const orm = new UsuarioOrmEntity();
    orm.id = usuario.id;
    orm.nome = usuario.getNome();
    orm.email = usuario.getEmail();
    orm.senhaHash = usuario.getSenhaHash();
    const salvo = await this.repo.save(orm);
    return Usuario.criar({
      id: salvo.id,
      nome: salvo.nome,
      email: salvo.email,
      senhaHash: salvo.senhaHash,
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const orm = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (!orm) return null;
    return Usuario.criar({
      id: orm.id,
      nome: orm.nome,
      email: orm.email,
      senhaHash: orm.senhaHash,
    });
  }
}
