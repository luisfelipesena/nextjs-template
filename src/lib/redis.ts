import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'
import { env } from '@/env'

if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
}

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(
    env.RATE_LIMIT_REQUESTS,
    env.RATE_LIMIT_WINDOW as `${number} ${'ms' | 's' | 'm' | 'h' | 'd'}`
  ),
  analytics: true,
  prefix: 'ratelimit',
})

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'auth_ratelimit',
})

export const apiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 h'),
  analytics: true,
  prefix: 'api_ratelimit',
})
