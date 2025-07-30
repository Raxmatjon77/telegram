import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { TransactionService } from './transaction.service'
import { CheckTransactionDto } from './dto'
import { HttpStatus } from '#common'

@Controller({
  path: 'transaction',
  version: '1',
})
export class TransactionController {
  readonly #_service: TransactionService

  constructor(service: TransactionService) {
    this.#_service = service
  }

  @HttpCode(HttpStatus.OK)
  @Post('check')
  async check(@Body() body: CheckTransactionDto) {
    return this.#_service.check(body)
  }

  @Post('prepay')
  @HttpCode(HttpStatus.OK)
  async prepay(@Body() body: any) {
    return this.#_service.prepay(body)
  }

  @Post('pay')
  @HttpCode(HttpStatus.OK)
  async pay(@Body() body: any) {
    return this.#_service.pay(body)
  }
}
