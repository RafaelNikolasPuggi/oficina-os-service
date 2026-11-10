import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppConfig } from '../config/configuration';

export const PRODUCAO_QUEUE_CLIENT = 'PRODUCAO_QUEUE_CLIENT';
export const PAGAMENTO_QUEUE_CLIENT = 'PAGAMENTO_QUEUE_CLIENT';

/**
 * Clientes RabbitMQ para publicar eventos da Saga nos outros dois
 * serviços. O os-service é o orquestrador: nunca escuta diretamente o que
 * acontece dentro de produção/pagamento, só publica comandos/eventos e
 * reage ao que eles devolvem (ver OrdensServicoEventsController).
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: PRODUCAO_QUEUE_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AppConfig, true>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('rabbitmq', { infer: true }).url],
            queue: 'producao_queue',
            queueOptions: { durable: true },
          },
        }),
      },
      {
        name: PAGAMENTO_QUEUE_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AppConfig, true>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get('rabbitmq', { infer: true }).url],
            queue: 'pagamento_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class MessagingModule {}
