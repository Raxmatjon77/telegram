export declare type Config = {
  bot: {
    token: string
  }
  database: {
    url: string
  }
  service: {
    ecom: {
      url: string
      username: string
      pass: string
    }
  }
  app: {
    token: string
  }
}

export const config = (): Config => ({
  bot: {
    token: process.env.BOT_TOKEN,
  },
  database: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/postgres',
  },
  service: {
    ecom: {
      url: process.env.ECOM_SERVICE_URL,
      username: process.env.ECOM_SERVICE_USERNAME,
      pass: process.env.ECOM_SERVICE_PASS,
    },
  },
  app: {
    token: process.env.APP_TOKEN,
  },
})
