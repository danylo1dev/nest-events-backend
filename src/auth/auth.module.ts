import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserController } from './users.controller';
import authJwtConfig from 'src/config/auth-jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      useFactory: authJwtConfig,
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
