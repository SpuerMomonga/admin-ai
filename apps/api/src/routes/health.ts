import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { healthResponseSchema } from '@admin-ai/contracts'

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  const startedAt = new Date().toISOString()

  app.route({
    method: 'GET',
    url: '/health',
    schema: {
      response: {
        200: healthResponseSchema,
      },
    },
    handler: async () => healthResponseSchema.parse({
      service: 'admin-ai-api',
      status: 'ok',
      startedAt,
      timestamp: new Date().toISOString(),
    }),
  })
}
