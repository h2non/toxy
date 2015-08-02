const expect = require('chai').expect
const Rule = require('../lib/rule')
const Directive = require('../lib/directive')

suite('rule', function () {
  test('enable/disable', function () {
    var rule = new Rule()
    var directive = new Directive(function rule() {
      throw new Error('Rule called!')
    })
    rule._rules(directive.handler())

    expect(rule._rules.stack).to.have.length(1)
    rule.disableRule('rule')
    expect(rule.getRules()[0].isEnabled()).to.be.false
  })

  test('flush', function () {
    var rule = new Rule()
    var directive = new Directive(function rule() {
      throw new Error('Rule called!')
    })
    rule._rules(directive.handler())

    expect(rule._rules.stack).to.have.length(1)
    rule.flushRules()
    expect(rule._rules.stack).to.have.length(0)
  })

  test('remove', function () {
    var rule = new Rule()
    var directive = new Directive(function rule() {
      throw new Error('Rule called!')
    })
    rule._rules(directive.handler())

    expect(rule._rules.stack).to.have.length(1)
    rule.removeRule('rule')
    expect(rule._rules.stack).to.have.length(0)
  })

  test('isEnabled', function () {
    var rule = new Rule()
    var directive = new Directive(function rule() {
      throw new Error('Rule called!')
    })
    rule._rules(directive.handler())

    expect(rule._rules.stack).to.have.length(1)
    expect(rule.isRuleEnabled('rule')).to.be.true
  })
})
