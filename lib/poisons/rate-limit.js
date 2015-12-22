module.exports = function rateLimit (opts) {
  opts = opts || {}

  const code = +opts.code || 429
  const limit = +opts.limit || 10
  const threshold = +opts.threshold || 1000
  const message = opts.message || 'Too many requests'

  var current = Date.now()
  var remaining = limit

  return function rateLimit (req, res, next) {
    const remaining = calculateRemaining()

    res.setHeader('X-RateLimit-Limit', limit | 0)
    res.setHeader('X-RateLimit-Remaining', Math.max(remaining, 0) | 0)
    res.setHeader('X-RateLimit-Reset', Math.min(remain(), threshold) | 0)

    // If still has remaining requests, allow it
    if (remaining >= 0) return next()

    // If the limit was exceeded, reply with the proper error
    limitExceeded(res)
  }

  function calculateRemaining () {
    if (remain() > threshold) {
      current = Date.now()
      remaining = limit
    }
    remaining -= 1
    return remaining
  }

  function remain () {
    return Date.now() - current
  }

  function limitExceeded (res) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Retry-After', (remain() / 1000) | 0)
    res.end(JSON.stringify({ error: message }))
  }
}
