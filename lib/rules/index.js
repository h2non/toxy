const rules = [
  'method',
  'percentage'
]

module.exports = rules.map(function (name) {
  return require('./' + name)
})
