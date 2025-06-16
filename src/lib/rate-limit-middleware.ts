import { HTTPException } from 'hono/http-exception'
import { ratelimit, authRatelimit, apiRatelimit } from '@/lib/redis'
import { createTransactionLogger, getClientIP } from '@/lib/logger'
import type { Context } from 'hono'
import type { Ratelimit } from '@upstash/ratelimit'

type RateLimitResult = Awaited<ReturnType<Ratelimit['limit']>>

export interface RateLimitOptions {
  type?: 'general' | 'auth' | 'api'
  identifier?: (c: Context) => string | Promise<string>
  onLimit?: (c: Context, limit: RateLimitResult) => Response | Promise<Response>
}

export const createRateLimitMiddleware = (options: RateLimitOptions = {}) => {
  const { type = 'general', identifier, onLimit } = options

  return async (c: Context, next: () => Promise<void>) => {
    const transactionId = c.req.header('x-transaction-id') || crypto.randomUUID()
    const logger = createTransactionLogger(transactionId)

    c.set('transactionId', transactionId)
    c.set('logger', logger)

    const getLimit = () => {
      switch (type) {
        case 'auth':
          return authRatelimit
        case 'api':
          return apiRatelimit
        default:
          return ratelimit
      }
    }

    const limit = getLimit()

    let rateLimitIdentifier: string

    if (identifier) {
      rateLimitIdentifier = await identifier(c)
    } else {
      const clientIP = getClientIP(c.req.raw)
      rateLimitIdentifier = clientIP
    }

    logger.info(
      {
        method: c.req.method,
        path: c.req.path,
        ip: rateLimitIdentifier,
        userAgent: c.req.header('user-agent'),
        type,
      },
      'Rate limit check'
    )

    try {
      const result = await limit.limit(rateLimitIdentifier)

      c.header('X-RateLimit-Limit', result.limit.toString())
      c.header('X-RateLimit-Remaining', result.remaining.toString())
      c.header('X-RateLimit-Reset', new Date(result.reset).toISOString())
      c.header('X-Transaction-ID', transactionId)

      if (!result.success) {
        logger.warn(
          {
            identifier: rateLimitIdentifier,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
            type,
          },
          'Rate limit exceeded'
        )

        if (onLimit) {
          const response = await onLimit(c, result)
          return response
        }

        throw new HTTPException(429, {
          message: 'Too many requests',
          res: new Response(
            JSON.stringify({
              error: 'Too many requests',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
                'X-RateLimit-Limit': result.limit.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': new Date(result.reset).toISOString(),
                'X-Transaction-ID': transactionId,
              },
            }
          ),
        })
      }

      logger.info(
        {
          identifier: rateLimitIdentifier,
          remaining: result.remaining,
          type,
        },
        'Rate limit check passed'
      )

      await next()
    } catch (error) {
      logger.error(
        {
          error: error instanceof Error ? error.message : String(error),
          identifier: rateLimitIdentifier,
          type,
        },
        'Rate limit middleware error'
      )

      throw error
    }
  }
}
