const expect = require('chai').expect
const inject = require('../..').poisons.inject

suite('poison#inject', function () {
  test('head', function (done) {
    const headers = { 'content-type': 'application/json' }
    const opts = { code: 500, headers: headers }
    const expected = { code: 500, headers: headers }

    const res = {}
    res.writeHead = writeHead
    res.end = end

    inject(opts)(null, res)

    function writeHead (code, headers) {
      expect(code).to.be.equal(expected.code)
      expect(headers).to.be.deep.equal(expected.headers)
    }

    function end (data) {
      expect(data).to.be.undefined
      done()
    }
  })

  test('status', function (done) {
    const opts = { body: 'Hello', encoding: 'utf8' }
    const expected = {
      code: 500,
      body: 'Hello',
      encoding: 'utf8',
      headers: { 'content-length': 5 }
    }

    const res = {}
    res.writeHead = writeHead
    res.end = end

    inject(opts)(null, res)

    function writeHead (code, headers) {
      expect(code).to.be.equal(expected.code)
      expect(headers).to.be.deep.equal(expected.headers)
    }

    function end (data, encoding) {
      expect(data).to.be.equal(expected.body)
      expect(encoding).to.be.equal(expected.encoding)
      done()
    }
  })

  test('merge headers', function (done) {
    const opts = { headers: { server: 'toxy' } }
    const expected = {
      code: 500,
      headers: { server: 'toxy', foo: 'bar' }
    }

    const res = {}
    res.headers = { server: 'nginx', foo: 'bar' }
    res.writeHead = writeHead
    res.end = end

    inject(opts)(null, res)

    function writeHead (code, headers) {
      expect(code).to.be.equal(expected.code)
      expect(headers).to.be.deep.equal(expected.headers)
    }

    function end (data, encoding) {
      expect(data).to.be.equal(expected.body)
      expect(encoding).to.be.equal(expected.encoding)
      done()
    }
  })
})
