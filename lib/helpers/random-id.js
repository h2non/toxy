module.exports = function randomId (head, tail) {
  const seed = head + '|' + tail
  var id = 0
  var len = seed.length
  while (len--) { id += seed.charCodeAt(len) }
  return id.toString(16).slice(0, 10)
}
