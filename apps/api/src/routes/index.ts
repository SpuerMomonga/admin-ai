import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'

import { dashboardRoutes } from './dashboard'
import { healthRoutes } from './health'

export const apiRoutes: FastifyPluginAsyncZod = async (app) => {
  await app.register(healthRoutes)
  await app.register(dashboardRoutes)
}
