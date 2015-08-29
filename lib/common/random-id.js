module.exports = function randomId(head, tail) {
  var id = 0
  var seed = head + '|' + tail
  var len = seed.length
  while (len--) { id += seed.charCodeAt(len) }
  return id.toString(16).slice(0, 10)
}
