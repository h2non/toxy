const sinon = require('sinon')
const expect = require('chai').expect
const common = require('../lib/common')

suite('common', function () {
  test('eachSeries', function (done) {
    var spy = sinon.spy()
    var arr = [ 1, 2, 3 ]

    function iterator(value, next) {
      spy(value)
      next()
    }

    common.eachSeries(arr, iterator, function (err) {
      expect(err).to.be.undefined
      expect(spy.calledThrice).to.be.true
      expect(spy.args[0][0]).to.be.equal(1)
      expect(spy.args[2][0]).to.be.equal(3)
      done(err)
    })
  })

  test('sliceBuffer', function () {
    var buf = []
    var buffer = new Buffer('Hello World')

    common.sliceBuffer(1, buffer, 'utf8', buf)

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

  test('sliceBuffer in lower chunk', function () {
    var buf = []
    var buffer = new Buffer('Hello World')

    common.sliceBuffer(1024, buffer, 'utf8', buf)

    expect(buf).to.have.length(1)
    expect(buf.shift()).to.be.deep.equal({
      buffer: new Buffer('Hello World'),
      encoding: 'utf8'
    })
  })
})
