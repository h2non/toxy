const parentHref = require('./common').parentHref

exports.allPoisons = function (req, res) {
  res.reply(exports.poisons(req))
}

exports.allRules = function (req, res) {
  res.reply(exports.rules(req))
}

exports.createPoison = createPartial('poisons')
exports.createRule = createPartial('rules')

function createPartial(type) {
  return function (req, res) {
    var body = createDirective(req, res, type)
    if (body) res.reply(body, 201)
  }
}

function createDirective(req, res, type) {
  var body = req.body
  var directives = req.toxy[type]
  var toxy = getStack(req)

  if (!body || !body.name) {
    res.statusCode = 400
    res.end()
    return
  }

  var name = body.name
  var directive = directives[name]
  if (typeof directive !== 'function') {
    res.statusCode = 404
    res.end()
    return
  }

  var method = type === 'poisons' ? 'poison' : 'rule'
  toxy[method](directive(body.options))

  var href = req.href + '/' + type + '/' + name
  return {
    name: name,
    links: {
      self: { href: href },
      parent: { href: parentHref(href) }
    }
  }
}

exports.deletePoisons = function (req, res) {
  deleteAll(req, 'poisons')
  res.statusCode = 204
  res.end()
}

exports.deleteRules = function (req, res) {
  deleteAll(req, 'rules')
  res.statusCode = 204
  res.end()
}

function deleteAll(req, type) {
  var stack = getStack(req)['_' + type]
  if (stack) stack.stack.splice(0)
}

exports.getPoison = function (req, res) {
  res.reply(getDirective(req, 'poisons')(req.toxyPoison))
}

exports.getRule = function (req, res) {
  res.reply(getDirective(req, 'rules')(req.toxyRule))
}

exports.deletePoison = function (req, res) {
  var stack = req.toxyRoute || req.toxy
  stack.remove(req.toxyPoison)
  res.statusCode = 204
  res.end()
}

exports.deleteRule = function (req, res) {
  var stack = req.toxyPoison || req.toxyRoute || req.toxy
  stack.removeRule(req.toxyRule)
  res.statusCode = 204
  res.end()
}

exports.poisons = function (req) {
  return exports.getDirectives(req, 'poisons')
}

exports.rules = function (req) {
  return exports.getDirectives(req, 'rules')
}

exports.getDirectives = function (req, type) {
  var stack = getStack(req)
  var pool = type === 'poisons' ? stack.getPoisons() : stack.getRules()
  return pool.map(getDirective(req, type))
}

function getDirective(req, type) {
  return function (directive) {
    var nested = !~req.href.indexOf(type)
      ? req.href + '/' + type + '/' + directive.name
      : req.href

    var data = {
      name: directive.name,
      enabled: directive.isEnabled()
    }

    if (type === 'poisons') {
      var rules = directive.getRules()
      data.rules = rules.map(getDirective({ href: nested }, 'rules'))
    }

    data.links = {
      self: { href: nested },
      parent: { href: parentHref(nested) }
    }

    return data
  }
}

function getStack(req) {
  return req.toxyRule || req.toxyPoison || req.toxyRoute || req.toxy
}
