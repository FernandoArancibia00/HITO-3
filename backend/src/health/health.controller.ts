
import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Verificar conexiones con PostgreSQL y MongoDB',
  })
  @ApiOkResponse({
    description: 'Ambas bases de datos están disponibles',
    schema: {
      example: {
        postgres: 'ok',
        mongo: 'ok',
      },
    },
  })
  async check() {
    return this.healthService.check();
  }
}
