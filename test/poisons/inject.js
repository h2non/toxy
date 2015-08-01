const expect = require('chai').expect
const inject = require('../..').poisons.inject

suite('poison#inject', function () {
  test('head', function (done) {
    var headers = { 'content-type': 'application/json' }
    var opts = { code: 500, headers: headers }
    var expected = { code: 500, headers: headers }

    var res = {}
    res.writeHead = writeHead
    res.end = end

    inject(opts)(null, res)

    function writeHead(code, headers) {
      expect(code).to.be.equal(expected.code)
      expect(headers).to.be.deep.equal(expected.headers)
    }

    function end(data) {
      expect(data).to.be.undefined
      done()
    }
  })

  test('status', function (done) {
    var opts = { body: 'Hello', encoding: 'utf8' }
    var expected = { code: 500, body: 'Hello', encoding: 'utf8' }

    var res = {}
    res.writeHead = writeHead
    res.end = end

    inject(opts)(null, res)

    function writeHead(code, headers) {
      expect(code).to.be.equal(expected.code)
      expect(headers).to.be.deep.equal(expected.headers)
    }

    function end(data, encoding) {
      expect(data).to.be.equal(expected.body)
      expect(encoding).to.be.equal(expected.encoding)
      done()
    }
  })
})
