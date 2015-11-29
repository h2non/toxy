module.exports = function isRegExp (o) {
  return !!o && Object.prototype.toString.call(o) === '[object RegExp]'
}
