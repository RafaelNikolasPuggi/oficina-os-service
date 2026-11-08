import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfig } from './configuration';

export function buildTypeOrmOptions(
  configService: ConfigService<AppConfig, true>,
): TypeOrmModuleOptions {
  const db = configService.get('database', { infer: true });

  return {
    type: 'postgres',
    host: db.host,
    port: db.port,
    username: db.username,
    password: db.password,
    database: db.database,
    // RDS exige SSL por padrão (pg_hba.conf rejeita conexão em texto puro).
    // rejectUnauthorized: false porque não empacotamos o bundle de CA da AWS
    // no container — aceitável aqui (tráfego já fica dentro da VPC privada).
    ssl: db.ssl ? { rejectUnauthorized: false } : false,
    autoLoadEntities: true,
    // Não há migrations neste MVP — o schema é sincronizado a partir das
    // entidades. Controlado por flag explícita (não por NODE_ENV) porque o
    // deploy em Kubernetes também roda com NODE_ENV=production e ainda
    // depende do synchronize até que migrations sejam introduzidas.
    synchronize: process.env.TYPEORM_SYNCHRONIZE !== 'false',
    logging: process.env.TYPEORM_LOGGING === 'true',
  };
}
