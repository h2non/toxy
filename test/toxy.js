const expect = require('chai').expect
const toxy = require('..')

suite('toxy', function () {
  test('api', function () {
    expect(toxy.rules).to.be.an('object')
    expect(toxy.poisons).to.be.an('object')
    expect(toxy.VERSION).to.be.a('string')
    expect(toxy.Directive).to.be.a('function')
    expect(toxy.Poison).to.be.a('function')
  })

  test('name', function () {

  })
})
