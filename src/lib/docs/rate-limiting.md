# Rate Limiting & Logging Documentation

## Setup

### 1. Environment Variables

Add these to your `.env.local`:

```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1 h

# Logging
LOG_LEVEL=info
```

### 2. Upstash Redis Setup

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add them to your environment variables

## Rate Limiting

### Default Configuration

- **General API**: 100 requests per hour
- **Auth endpoints**: 5 requests per 15 minutes
- **Specific API routes**: 200 requests per hour

### Rate Limit Types

```typescript
// General rate limiting (default)
const rateLimitMiddleware = createRateLimitMiddleware({
  type: 'general',
})

// Auth rate limiting (stricter)
const authRateLimitMiddleware = createRateLimitMiddleware({
  type: 'auth',
})

// API rate limiting
const apiRateLimitMiddleware = createRateLimitMiddleware({
  type: 'api',
})
```

### Custom Identifier

```typescript
const customRateLimit = createRateLimitMiddleware({
  type: 'general',
  identifier: async (c) => {
    // Use user ID if authenticated, fallback to IP
    const userId = c.get('userId')
    return userId || getClientIP(c.req.raw)
  },
})
```

**Note**: The default identifier uses IP address extraction with multiple fallback strategies:
1. `x-forwarded-for` header (first IP)
2. `x-real-ip` header  
3. `forwarded` header parsing
4. Falls back to 'unknown' if none available

### Response Headers

Rate limit middleware adds these headers:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: When the rate limit resets
- `X-Transaction-ID`: Unique transaction identifier

### Redis Configuration Validation

The Redis configuration automatically validates required environment variables on startup:

```typescript
// Throws error if missing
if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Redis configuration missing. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN')
}
```

This ensures fail-fast behavior if Redis credentials are not properly configured.

## Logging

### Transaction IDs

Every request gets a unique transaction ID for tracing:

```typescript
import { createTransactionLogger } from '@/lib/logger'

const logger = createTransactionLogger() // Auto-generates ID
// or
const logger = createTransactionLogger('custom-id')

logger.info({ userId: '123' }, 'User action completed')
```

### Log Levels

- `error`: Error conditions
- `warn`: Warning conditions
- `info`: Informational messages (default)
- `debug`: Debug-level messages

### Development vs Production

**Development**: Pretty-printed logs with colors
**Production**: JSON structured logs for better parsing

## Usage Examples

### In JStack Router

```typescript
import { createRateLimitMiddleware } from '@/lib/rate-limit-middleware'

const apiRouter = j.router()
  .use(createRateLimitMiddleware({ type: 'api' }))
  .query('getData', async ({ c, ctx }) => {
    const logger = c.get('logger')
    logger.info('Data requested')
    
    // Your logic here
  })
```

### In Regular Middleware

```typescript
app.use('/api/special/*', createRateLimitMiddleware({
  type: 'general',
  identifier: async (c) => {
    return c.req.header('x-api-key') || getClientIP(c.req.raw)
  },
  onLimit: async (c, limit) => {
    return new Response('Custom rate limit message', { 
      status: 429,
      headers: { 'Retry-After': '60' }
    })
  }
}))
```

## Monitoring

### Redis Analytics

The rate limiter includes analytics by default. You can view:

- Request patterns per IP/user
- Rate limit hits and patterns
- Peak usage times

### Logs Analysis

Search logs by transaction ID:

```bash
# In development
grep "transaction-id-here" logs.txt

# In production (structured logs)
jq '.transactionId == "transaction-id-here"' logs.jsonl
```

## Best Practices

1. **Different Limits for Different Endpoints**
   - Auth: Very restrictive (5/15min)
   - Public API: Moderate (100/hour)
   - Internal API: Higher (200/hour)

2. **User-based Rate Limiting**
   - Use user ID when available
   - Fallback to IP for anonymous users

3. **Graceful Degradation**
   - Provide clear error messages
   - Include retry-after headers
   - Log rate limit hits for monitoring

4. **Transaction Tracing**
   - Use transaction IDs for debugging
   - Include relevant context in logs
   - Monitor error patterns

## Troubleshooting

### Rate Limit Not Working

1. Check Redis connection
2. Verify environment variables
3. Check middleware order (should be early)

### High Redis Usage

1. Review rate limit windows
2. Check for bot traffic
3. Consider implementing user-based limits

### Missing Logs

1. Verify LOG_LEVEL setting
2. Check if middleware is properly registered
3. Ensure transaction IDs are generated

## Testing the Implementation

### 1. Test Rate Limiting

```bash
# Test rate limiting by making multiple requests
for i in {1..10}; do
  curl -i http://localhost:3000/api/posts/recent
  echo "Request $i completed"
  sleep 1
done
```

Expected behavior:
- First requests return 200 with rate limit headers
- After hitting limit, returns 429 with `Retry-After` header
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 2. Test Transaction ID

```bash
# Test with custom transaction ID
curl -H "x-transaction-id: test-123" http://localhost:3000/api/posts/recent

# Test auto-generated transaction ID
curl -i http://localhost:3000/api/posts/recent
```

Expected behavior:
- Response includes `X-Transaction-ID` header
- Logs show the same transaction ID for the request
- Custom transaction ID is used when provided

### 3. Test IP-based Rate Limiting

```bash
# Test from different IPs (using proxy headers)
curl -H "x-forwarded-for: 192.168.1.100" http://localhost:3000/api/posts/recent
curl -H "x-real-ip: 192.168.1.101" http://localhost:3000/api/posts/recent
```

Expected behavior:
- Different IPs have separate rate limit counters
- Logs show the extracted IP address
- Rate limiting applies per unique IP

### 4. Verify Logs

Check your development logs for structured output:

```bash
# Look for rate limit logs
npm run dev | grep "Rate limit check"

# Look for transaction IDs
npm run dev | grep "transactionId"
```

Expected log format:
```json
{
  "level": "info",
  "transactionId": "uuid-here",
  "method": "GET",
  "path": "/api/posts/recent",
  "ip": "127.0.0.1",
  "msg": "Rate limit check"
}
``` 