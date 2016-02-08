exports._getAll = function (mw) {
  return mw.stack.map(function (fn) {
    return fn.$of
  })
}

exports._disableAll = function (mw) {
  mw.stack.forEach(function (fn) {
    fn.$of.disable()
  })
  return this
}

exports._remove = function (mw, name) {
  const item = searchInStack(mw, name)
  if (item) {
    mw.remove(item)
    return true
  }
  return false
}

exports._callMethod = function (mw, action, name) {
  const item = searchInStack(mw, name)
  if (item) return item.$of[action]()
  return false
}

exports._getDirective = function (mw, name) {
  const item = searchInStack(mw, name)
  if (item) return item.$of || item
  return null
}

function searchInStack (mw, name) {
  const stack = mw.stack
  for (var i = 0, l = stack.length; i < l; i += 1) {
    var node = stack[i]
    if (node.$name === name || node.$of === name ||
      node.name === name || node === name) {
      return node
    }
  }
  return false
}
