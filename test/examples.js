const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const spawn = require('child_process').spawn
const eachSeries = require('../lib/helpers').eachSeries

const rootDir = path.join(__dirname, '..')
const examplesDir = path.join(rootDir, 'examples')

suite('examples', function () {
  test('run examples', function (done) {
    this.timeout(30 * 1000)

    const files = fs.readdirSync(examplesDir)
    eachSeries(files, function (file, next) {
      if (!(/.js$/.test(file))) return next()

      const examplePath = path.join(examplesDir, file)
      const child = spawn('node', [ examplePath ])

      var assert = false
      child.stdout.on('data', function (chunk) {
        if (assert) return
        expect(chunk.toString()).to.not.match(/error/i)
        assert = true
        child.kill('SIGHUP')
        next()
      })

      child.stderr.on('data', function (chunk) {
        next(new Error(chunk.toString()))
      })

      child.on('close', function (code) {
        if (!assert) {
          next(new Error('Process exited for file ' + file + ' with code: ' + code))
        }
      })
    }, done)
  })
})
