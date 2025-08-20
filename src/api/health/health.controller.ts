import { Get, HttpCode, HttpStatus, Controller } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
@ApiTags('health')
@Controller({
  path: 'health',
})
export class HealthController {
  @Get('ping')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint', description: 'Simple health check endpoint to verify service availability' })
  @ApiResponse({ status: 200, description: 'Service is healthy', type: String })
  ping(): string {
    return 'pong!'
  }
}
