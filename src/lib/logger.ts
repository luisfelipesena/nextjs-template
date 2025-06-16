import pino from 'pino'
import { v4 as uuidv4 } from 'uuid'

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '[{transactionId}] {msg}',
      },
    },
  }),
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'localhost',
  },
})

export const createTransactionLogger = (transactionId?: string) => {
  const txId = transactionId || uuidv4()

  return logger.child({ transactionId: txId })
}

export const getClientIP = (request: Request): string => {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIP = request.headers.get('x-real-ip')
  const forwardedFor = request.headers.get('forwarded')

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0]?.trim() ?? 'unknown'
  }

  if (xRealIP) {
    return xRealIP
  }

  if (forwardedFor) {
    const match = forwardedFor.match(/for=([^;,]+)/)
    if (match?.[1]) {
      return match[1].replace(/"/g, '')
    }
  }

  return 'unknown'
}

export type Logger = ReturnType<typeof createTransactionLogger>
