export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? '',
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:3000',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? '',
  RATE_LIMIT_REQUESTS: Number(process.env.RATE_LIMIT_REQUESTS) || 100,
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW ?? '1 h',
}
