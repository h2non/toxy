const sinon = require('sinon')
const expect = require('chai').expect
const helpers = require('../lib/helpers')

suite('helpers', function () {
  test('isRegExp', function () {
    expect(helpers.isRegexp(/0-9/)).to.be.true
    expect(helpers.isRegexp(new RegExp)).to.be.true
    expect(helpers.isRegexp(null)).to.be.false
    expect(helpers.isRegexp([])).to.be.false
    expect(helpers.isRegexp({})).to.be.false
    expect(helpers.isRegexp('')).to.be.false
    expect(helpers.isRegexp(123)).to.be.false
    expect(helpers.isRegexp(void 0)).to.be.false
  })

  test('eachSeries', function (done) {
    var spy = sinon.spy()
    var arr = [ 1, 2, 3 ]

    function iterator (value, next) {
      spy(value)
      next()
    }

    helpers.eachSeries(arr, iterator, function (err) {
      expect(err).to.be.undefined
      expect(spy.calledThrice).to.be.true
      expect(spy.args[0][0]).to.be.equal(1)
      expect(spy.args[2][0]).to.be.equal(3)
      done(err)
    })
  })

  test('randomId', function () {
    var id = helpers.randomId('foo', 'bar')
    expect(id).to.be.equal('2f5')
  })

  test('matchBody', function () {
    var match = helpers.matchBody('foobar', 'foo')
    expect(match).to.be.true

    var match = helpers.matchBody('foobar', /^foo/i)
    expect(match).to.be.true

    var match = helpers.matchBody('foobar', function (body) {
      return !!~body.indexOf('foo')
    })
    expect(match).to.be.true

    var match = helpers.matchBody('foo', 'bar')
    expect(match).to.be.false

    var match = helpers.matchBody('foo', /bar/i)
    expect(match).to.be.false
  })

  test('matchHeaders', function () {
    var res = { headers: { server: 'foobar' } }

    var match = helpers.matchHeaders(res, { server: /^Foo/i })
    expect(match).to.be.true

    var match = helpers.matchHeaders(res, { server: 'foo' })
    expect(match).to.be.true

    function assert (value, key) { return !!~value.indexOf('foo') }
    var match = helpers.matchHeaders(res, { server: assert })
    expect(match).to.be.true
  })

  test('splitBuffer', function () {
    var buf = []
    var buffer = new Buffer('Hello World')

    helpers.splitBuffer(1, buffer, 'utf8', buf)

    expect(buf).to.have.length(11)
    expect(buf.shift()).to.be.deep.equal({
      buffer: new Buffer('H'),
      encoding: 'utf8'
    })
    expect(buf.pop()).to.be.deep.equal({
      buffer: new Buffer('d'),
      encoding: 'utf8'
    })
  })

  test('splitBuffer in large chunks', function () {
    var buf = []
    var buffer = new Buffer('Hello World')

    helpers.splitBuffer(1024, buffer, 'utf8', buf)

    expect(buf).to.have.length(1)
    expect(buf.shift()).to.be.deep.equal({
      buffer: new Buffer('Hello World'),
      encoding: 'utf8'
    })
  })
})
