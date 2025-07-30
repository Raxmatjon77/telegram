import { Module } from '@nestjs/common'
import { TransactionModule } from './transaction'

@Module({
  imports: [TransactionModule],
})
export class V1Module {}
