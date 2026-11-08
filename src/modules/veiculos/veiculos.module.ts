import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosService } from './application/veiculos.service';
import { VEICULO_REPOSITORY } from './domain/veiculo.repository';
import { VeiculoOrmEntity } from './infrastructure/veiculo.orm-entity';
import { TypeOrmVeiculoRepository } from './infrastructure/veiculo.repository.impl';
import { VeiculosController } from './interfaces/http/veiculos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VeiculoOrmEntity]),
    AuthModule,
    ClientesModule,
  ],
  controllers: [VeiculosController],
  providers: [
    VeiculosService,
    { provide: VEICULO_REPOSITORY, useClass: TypeOrmVeiculoRepository },
  ],
  exports: [VEICULO_REPOSITORY],
})
export class VeiculosModule {}
