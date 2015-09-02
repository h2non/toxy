const sinon = require('sinon')
const expect = require('chai').expect
const helpers = require('../lib/helpers')

suite('helpers', function () {
  test('isRegExp', function () {
    expect(helpers.isRegExp(/0-9/)).to.be.true
    expect(helpers.isRegExp(new RegExp)).to.be.true
    expect(helpers.isRegExp(null)).to.be.false
    expect(helpers.isRegExp([])).to.be.false
    expect(helpers.isRegExp({})).to.be.false
    expect(helpers.isRegExp('')).to.be.false
    expect(helpers.isRegExp(123)).to.be.false
    expect(helpers.isRegExp(void 0)).to.be.false
  })

  test('eachSeries', function (done) {
    var spy = sinon.spy()
    var arr = [ 1, 2, 3 ]

    function iterator(value, next) {
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
