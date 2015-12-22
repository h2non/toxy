const toStr = Object.prototype.toString

module.exports = function isRegExp (o) {
  return !!o && toStr.call(o) === '[object RegExp]'
}
