module.exports = Base

function Base() {}

Base.prototype._getAll = function (stack) {
  return stack.map(function (fn) {
    return fn.$of
  })
}

Base.prototype._disableAll = function (stack) {
  stack.forEach(function (fn) {
    fn.$of.disable()
  })
  return this
}

Base.prototype._callMethod = function (stack, action, name) {
  for (var i = 0, l = stack.length; i < l; i += 1) {
    if (stack[i].$name === name || stack[i].$of === name) {
      return stack[i].$of[action]()
    }
  }
  return false
}
