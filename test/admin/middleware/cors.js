const toxy = require('../../..')
const supertest = require('supertest')

suite('admin#middleware#cors', function () {
  const opts = { cors: true }
  const admin = toxy.admin(opts)
  const port = 9890
  const adminUrl = 'http://localhost:' + port

  admin.listen(port)

  after(function (done) {
    admin.close(done)
  })

  test('authorize origin', function (done) {
    supertest(adminUrl)
      .get('/')
      .set('Origin', 'foobar')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'foobar')
      .expect('Access-Control-Allow-Credentials', 'true')
      .end(done)
  })

  test('authorize headers', function (done) {
    supertest(adminUrl)
      .get('/')
      .set('Origin', 'foobar')
      .set('access-control-request-headers', 'foo')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'foobar')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect('Access-Control-Allow-Headers', 'foo')
      .end(done)
  })

  test('authorize methods', function (done) {
    supertest(adminUrl)
      .get('/')
      .set('Origin', 'foobar')
      .set('access-control-request-method', 'GET,POST')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'foobar')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect('Access-Control-Allow-Methods', 'GET,POST')
      .end(done)
  })
})
