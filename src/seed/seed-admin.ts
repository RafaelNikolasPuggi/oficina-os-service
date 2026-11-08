import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { UsuarioOrmEntity } from '../modules/auth/infrastructure/usuario.orm-entity';

/**
 * Cria (ou atualiza a senha de) um usuário administrativo inicial, usado
 * para autenticar nas rotas protegidas por JWT.
 *
 * Uso: ADMIN_EMAIL=admin@oficina.com ADMIN_PASSWORD=SenhaForte123 npm run seed:admin
 */
async function bootstrap() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@oficina.com').toLowerCase();
  const senha = process.env.ADMIN_PASSWORD ?? 'admin123';
  const nome = process.env.ADMIN_NOME ?? 'Administrador';

  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<UsuarioOrmEntity>>(
    getRepositoryToken(UsuarioOrmEntity),
  );

  const senhaHash = await bcrypt.hash(senha, 10);
  const existente = await repo.findOne({ where: { email } });

  if (existente) {
    existente.senhaHash = senhaHash;
    existente.nome = nome;
    await repo.save(existente);

    console.log(`Usuário admin "${email}" atualizado.`);
  } else {
    const usuario = repo.create({ id: randomUUID(), nome, email, senhaHash });
    await repo.save(usuario);

    console.log(`Usuário admin "${email}" criado.`);
  }

  await app.close();
}

bootstrap().catch((err) => {
  console.error('Falha ao criar usuário admin:', err);
  process.exit(1);
});
