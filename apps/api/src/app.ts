import process from 'node:process'
import cors from '@fastify/cors'
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

import { env } from './config/env'
import { apiRoutes } from './routes'

export function createApp() {
  const logger = process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        },
      }
    : true

  const app = Fastify({
    logger,
  })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(cors, {
    origin: env.API_CORS_ORIGIN === '*'
      ? true
      : env.API_CORS_ORIGIN.split(',').map(item => item.trim()).filter(Boolean),
  })

  app.get('/', async () => ({
    name: 'admin-ai-api',
    status: 'ready',
  }))

  app.register(apiRoutes, {
    prefix: '/api',
  })

  return app
}
