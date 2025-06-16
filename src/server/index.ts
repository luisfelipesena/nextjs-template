import { j } from '@/server/jstack'
import { postRouter } from './routers/post-router'
import { createRateLimitMiddleware } from '@/lib/rate-limit-middleware'
import { createTransactionLogger } from '@/lib/logger'
import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'

const rateLimitMiddleware = createRateLimitMiddleware({
  type: 'general',
})

const globalErrorHandler = (err: Error, c: Context) => {
  const transactionId = c.get('transactionId') || crypto.randomUUID()
  const logger = c.get('logger') || createTransactionLogger(transactionId)

  const errorContext = {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    transactionId,
  }

  if (err instanceof HTTPException) {
    if (err.status >= 500) {
      logger.error(errorContext, 'Internal server error')
    } else if (err.status >= 400) {
      logger.warn(errorContext, 'Client error')
    }
  } else {
    logger.error(errorContext, 'Unhandled error occurred')
  }

  return j.defaults.errorHandler(err)
}

const api = j.router().basePath('/api').use(j.defaults.cors).use(rateLimitMiddleware).onError(globalErrorHandler)

const appRouter = j.mergeRouters(api, {
  post: postRouter,
})

export type AppRouter = typeof appRouter

export default appRouter
