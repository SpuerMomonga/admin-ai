import process from 'node:process'
import { z } from 'zod/v4'

const envSchema = z.object({
  API_HOST: z.string().default('0.0.0.0'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  API_CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

export type AppEnv = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
