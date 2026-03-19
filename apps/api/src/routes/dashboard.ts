import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { dashboardSummarySchema } from '@admin-ai/contracts'

export const dashboardRoutes: FastifyPluginAsyncZod = async (app) => {
  app.route({
    method: 'GET',
    url: '/dashboard/summary',
    schema: {
      response: {
        200: dashboardSummarySchema,
      },
    },
    handler: async () => dashboardSummarySchema.parse({
      refreshedAt: new Date().toISOString(),
      metrics: [
        {
          id: 'users',
          label: 'Managed Users',
          value: '1,284',
          delta: '+12.4%',
          tone: 'positive',
          description: 'Accounts currently active in the administration console.',
        },
        {
          id: 'uptime',
          label: 'API Availability',
          value: '99.98%',
          delta: '+0.2%',
          tone: 'positive',
          description: 'Rolling 30-day uptime across core administrative services.',
        },
        {
          id: 'reviews',
          label: 'Pending Reviews',
          value: '18',
          delta: '-6',
          tone: 'neutral',
          description: 'Items still waiting for manual verification or approval.',
        },
      ],
      notices: [
        'Static frontend build is ready to consume runtime API configuration.',
        'Shared contracts are defined in packages/contracts.',
      ],
    }),
  })
}
