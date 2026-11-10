import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingModule } from '../../messaging/messaging.module';
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
import {
  RabbitMqSagaEventsPublisher,
  SAGA_EVENTS_PUBLISHER,
} from './infrastructure/saga-events.publisher';
import { OrdensServicoEventsController } from './interfaces/messaging/ordens-servico.events-controller';
import { OrdensServicoController } from './interfaces/http/ordens-servico.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServicoOrmEntity]),
    ConfigModule,
    MessagingModule,
    AuthModule,
    ClientesModule,
    VeiculosModule,
  ],
  controllers: [OrdensServicoController, OrdensServicoEventsController],
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
    {
      provide: SAGA_EVENTS_PUBLISHER,
      useClass: RabbitMqSagaEventsPublisher,
    },
  ],
})
export class OrdensServicoModule {}
