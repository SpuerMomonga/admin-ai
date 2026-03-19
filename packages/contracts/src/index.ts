import { z } from 'zod/v4'

export const metricToneSchema = z.enum(['positive', 'neutral', 'warning'])

export const healthResponseSchema = z.object({
  service: z.string(),
  status: z.enum(['ok', 'degraded']),
  startedAt: z.string().datetime(),
  timestamp: z.string().datetime(),
})

export const dashboardMetricSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  delta: z.string(),
  tone: metricToneSchema,
  description: z.string(),
})

export const dashboardSummarySchema = z.object({
  refreshedAt: z.string().datetime(),
  metrics: z.array(dashboardMetricSchema).min(1),
  notices: z.array(z.string()),
})

export type DashboardMetric = z.infer<typeof dashboardMetricSchema>
export type DashboardSummary = z.infer<typeof dashboardSummarySchema>
export type HealthResponse = z.infer<typeof healthResponseSchema>
export type MetricTone = z.infer<typeof metricToneSchema>
