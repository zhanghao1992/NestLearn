import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

/**
 * JWT 策略：从 Authorization: Bearer <token> 提取并验证 token
 * 验证通过后，req.user 会被赋值为 AuthService.validateUser 的返回值
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-secret'),
    });
  }

  /** Passport 校验通过后会调用此方法，附加用户信息到 req.user */
  async validate(payload: JwtPayload) {
    return this.authService.validateUser(payload);
  }
}
