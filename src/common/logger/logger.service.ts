import { Scope, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fastRedact, { redactFnNoSerialize } from 'fast-redact'

declare type LoggerLevel = 'log' | 'warn' | 'error'

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  #_context?: string
  readonly #_redact: redactFnNoSerialize
  readonly #_levels: LoggerLevel[]

  constructor(config: ConfigService) {
    this.#_redact = fastRedact({
      paths: config.get<string[]>('logger.redact', ['*.body.token', '*.headers.authorization']),
      censor: '[CENSORED]',
      serialize: false,
    })

    this.#_levels = config.get<LoggerLevel[]>('logger.levels', ['log', 'warn', 'error'])
  }

  log(msg: any, ctx?: string): void {
    this.#_write('log', msg, ctx)
  }

  warn(msg: any, ctx?: string): void {
    this.#_write('warn', msg, ctx)
  }

  error(msg: any, ctx?: string): void {
    this.#_write('error', msg, ctx)
  }

  setContext(ctx: string): void {
    this.#_context = ctx
  }

  #_write(lvl: LoggerLevel, msg: any, ctx?: string): void {
    if (!this.#_isLevelEnabled(lvl)) {
      return
    }

    if (!msg) {
      return
    }

    const date = new Date()

    if (!ctx) {
      ctx = this.#_context ?? LoggerService.name
    }

    if (msg instanceof Set) {
      msg = Array.from(msg)
    } else if (msg instanceof Map) {
      msg = Array.from(msg)
    } else if (msg instanceof Error) {
      msg = msg.message
    } else if (typeof msg === 'bigint') {
      msg = msg.toString()
    } else if (typeof msg === 'symbol') {
      msg = msg.toString()
    } else if (typeof msg === 'object') {
      msg = this.#_redact(msg)
    }

    process.stdout.write(`${JSON.stringify({ lvl, date, ctx, msg })}\n`)
  }

  #_isLevelEnabled(lvl: LoggerLevel): boolean {
    if (!this.#_levels) {
      return true
    }

    return this.#_levels.includes(lvl)
  }
}
