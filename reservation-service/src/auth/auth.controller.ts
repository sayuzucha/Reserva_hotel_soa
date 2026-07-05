import { Controller, Post, Body } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'hotel2026' })
  @IsString()
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwt: JwtService) {}

  @Post('login')
  @ApiOperation({ summary: 'Obtener JWT para usar en los endpoints protegidos' })
  login(@Body() dto: LoginDto) {
    // Demo: cualquier usuario/password retorna token
    const payload = { username: dto.username, sub: 1 };
    return { access_token: this.jwt.sign(payload) };
  }
}
