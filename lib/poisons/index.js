module.exports = [
  'inject',
  'abort',
  'latency',
  'throttle',
  'timeout',
  'bandwidth',
  'rate-limit',
  'slow-close',
  'slow-open',
  'slow-read'
].map(function (module) {
  return require('./' + module)
})
