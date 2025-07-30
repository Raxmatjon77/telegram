import { Get, HttpCode, HttpStatus, Controller } from '@nestjs/common'
@Controller({
  path: 'health',
})
export class HealthController {
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  ping(): string {
    return 'pong!'
  }
}
