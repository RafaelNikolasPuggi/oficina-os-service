import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientesService } from './application/clientes.service';
import { CLIENTE_REPOSITORY } from './domain/cliente.repository';
import { ClienteOrmEntity } from './infrastructure/cliente.orm-entity';
import { TypeOrmClienteRepository } from './infrastructure/cliente.repository.impl';
import { ClientesController } from './interfaces/http/clientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteOrmEntity]), AuthModule],
  controllers: [ClientesController],
  providers: [
    ClientesService,
    { provide: CLIENTE_REPOSITORY, useClass: TypeOrmClienteRepository },
  ],
  exports: [CLIENTE_REPOSITORY],
})
export class ClientesModule {}
