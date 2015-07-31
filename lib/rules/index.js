const rules = [
  'method',
  'probability'
]

module.exports = rules.map(function (name) {
  return require('./' + name)
})
