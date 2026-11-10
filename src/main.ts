import './tracer';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfig } from './config/configuration';
import { JsonLoggerService } from './shared/logging/json-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new JsonLoggerService(),
  });

  const configService = app.get(ConfigService<AppConfig, true>);
  const rabbitmq = configService.get('rabbitmq', { infer: true });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmq.url],
      queue: rabbitmq.queue,
      queueOptions: { durable: true },
    },
  });

  app.use(
    helmet({
      // O deploy real (NLB) serve a aplicação em HTTP puro, sem TLS
      // terminado no load balancer — a diretiva padrão
      // upgrade-insecure-requests faz o navegador forçar HTTPS para
      // todo asset (JS/CSS do Swagger UI, por exemplo), que falha
      // silenciosamente por não haver listener HTTPS, deixando a página
      // em branco.
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'upgrade-insecure-requests': null,
        },
      },
    }),
  );
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Oficina Mecânica — OS Service')
    .setDescription(
      'Microsserviço de clientes, veículos e ordens de serviço (orquestrador da Saga) — Tech Challenge Fase 4.',
    )
    .setVersion('4.0.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Aplicação rodando em http://localhost:${port} — docs em /docs`);
}
void bootstrap();
