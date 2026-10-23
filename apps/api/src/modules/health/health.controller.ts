import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Connection } from 'mongoose';
import { Public } from '../../common/decorators/public.decorator.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @SkipThrottle()
  @Get()
  @ApiOperation({ summary: 'Kiểm tra tình trạng API và kết nối MongoDB' })
  check() {
    return {
      status: 'ok',
      database: this.connection.readyState === 1 ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}
