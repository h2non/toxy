module.exports = [
  'body',
  'method',
  'headers',
  'probability',
  'content-type',
].map(function (module) {
  return require('./' + module)
})
