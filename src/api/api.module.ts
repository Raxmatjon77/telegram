import { Module } from '@nestjs/common'
import { V1Module } from './v1'
import { HealthModule } from './health'

@Module({
  imports: [V1Module, HealthModule],
})
export class ApiModule {}
