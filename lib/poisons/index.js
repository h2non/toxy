module.exports = [
  'inject',
  'abort',
  'latency',
  'throttle',
  'timeout',
  'rate-limit',
  'slow-close',
  'slow-open',
  'slow-read',
  'bandwidth'
].map(function (module) {
  return require('./' + module)
})
