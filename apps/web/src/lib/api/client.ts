import type { DashboardSummary, HealthResponse } from '@admin-ai/contracts'
import {

  dashboardSummarySchema,

  healthResponseSchema,
} from '@admin-ai/contracts'

const apiBaseUrl = (import.meta.env.PUBLIC_API_BASE_URL ?? 'http://localhost:3001').replace(/\/$/, '')

interface Parser<T> {
  parse: (input: unknown) => T
}

async function request<T>(path: string, schema: Parser<T>) {
  const response = await fetch(`${apiBaseUrl}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  const payload = await response.json()
  return schema.parse(payload)
}

export const apiClient = {
  dashboardSummary: () => request<DashboardSummary>('/api/dashboard/summary', dashboardSummarySchema),
  health: () => request<HealthResponse>('/api/health', healthResponseSchema),
  baseUrl: apiBaseUrl,
}
