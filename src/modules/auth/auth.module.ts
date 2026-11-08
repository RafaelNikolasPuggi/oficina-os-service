import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfig } from '../../config/configuration';
import { AuthService } from './application/auth.service';
import { USUARIO_REPOSITORY } from './domain/usuario.repository';
import { UsuarioOrmEntity } from './infrastructure/usuario.orm-entity';
import { TypeOrmUsuarioRepository } from './infrastructure/usuario.repository.impl';
import { AuthController } from './interfaces/http/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ClienteJwtStrategy } from './strategies/cliente-jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ClienteAuthGuard } from './guards/cliente-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsuarioOrmEntity]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfig, true>) => {
        const jwt = configService.get('jwt', { infer: true });
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresIn as unknown as number },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    ClienteJwtStrategy,
    JwtAuthGuard,
    ClienteAuthGuard,
    { provide: USUARIO_REPOSITORY, useClass: TypeOrmUsuarioRepository },
  ],
  exports: [JwtAuthGuard, ClienteAuthGuard, JwtModule],
})
export class AuthModule {}
