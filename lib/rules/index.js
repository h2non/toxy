module.exports = [
  'body',
  'method',
  'headers',
  'probability',
  'content-type',
  'response-body',
  'response-status',
  'response-headers'
].map(function (module) {
  return require('./' + module)
})
