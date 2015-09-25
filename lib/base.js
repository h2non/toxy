module.exports = Base

function Base() {}

Base.prototype._getAll = function (mw) {
  return mw.stack.map(function (fn) {
    return fn.$of
  })
}

Base.prototype._disableAll = function (mw) {
  mw.stack.forEach(function (fn) {
    fn.$of.disable()
  })
  return this
}

Base.prototype._remove = function (mw, name) {
  var item = this._searchInStack(mw, name)
  if (item) {
    mw.remove(item)
    return true
  }
  return false
}

Base.prototype._callMethod = function (mw, action, name) {
  var item = this._searchInStack(mw, name)
  if (item) return item.$of[action]()
  return false
}

Base.prototype._getDirective = function (mw, name) {
  var item = this._searchInStack(mw, name)
  if (item) return item.$of || item
  return null
}

Base.prototype._searchInStack = function (mw, name) {
  var stack = mw.stack
  for (var i = 0, l = stack.length; i < l; i += 1) {
    var node = stack[i]
    if (node.$name === name || node.$of === name
    ||  node.name === name || node === name) {
      return node
    }
  }
  return false
}
