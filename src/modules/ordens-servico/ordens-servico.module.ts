import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ClientesModule } from '../clientes/clientes.module';
import { VeiculosModule } from '../veiculos/veiculos.module';
import { OrdensServicoService } from './application/ordens-servico.service';
import { ORDEM_SERVICO_REPOSITORY } from './domain/ordem-servico.repository';
import { OrdemServicoOrmEntity } from './infrastructure/ordem-servico.orm-entity';
import { TypeOrmOrdemServicoRepository } from './infrastructure/ordem-servico.repository.impl';
import {
  HttpProducaoServiceClient,
  PRODUCAO_SERVICE_CLIENT,
} from './infrastructure/producao-service.client';
import { OrdensServicoController } from './interfaces/http/ordens-servico.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServicoOrmEntity]),
    ConfigModule,
    AuthModule,
    ClientesModule,
    VeiculosModule,
  ],
  controllers: [OrdensServicoController],
  providers: [
    OrdensServicoService,
    {
      provide: ORDEM_SERVICO_REPOSITORY,
      useClass: TypeOrmOrdemServicoRepository,
    },
    {
      provide: PRODUCAO_SERVICE_CLIENT,
      useClass: HttpProducaoServiceClient,
    },
  ],
})
export class OrdensServicoModule {}
