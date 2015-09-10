module.exports = function rateLimit(opts) {
  opts = opts || {}

  var limit = +opts.limit || 10
  var code = +opts.code || 429
  var threshold = +opts.threshold || 1000
  var message = opts.message || 'Too many requests'

  var current = Date.now()
  var remaining = limit

  return function rateLimit(req, res, next) {
    var remaining = calculateRemaining()

    res.setHeader('X-RateLimit-Limit', limit)
    res.setHeader('X-RateLimit-Remaining', Math.max(remaining, 0))
    res.setHeader('X-RateLimit-Reset', Math.min(remain(), threshold))

    if (remaining >= 0) {
      return next()
    }

    // If the limit was exceeded, reply with the proper error
    limitExceeded(res)
  }

  function calculateRemaining() {
    if (remain() > threshold) {
      current = Date.now()
      remaining = limit
    }
    return remaining -= 1
  }

  function remain() {
    return Date.now() - current
  }
  
  function limitExceeded(res) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  }
}
