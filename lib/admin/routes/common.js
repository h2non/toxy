exports.parentHref = function (href) {
  return href.split('/').slice(0, -1).join('/')
}
