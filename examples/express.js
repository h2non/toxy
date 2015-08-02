const express = require('express')
const toxy = require('..')

const proxy = toxy()

proxy.forward('http://httpbin.org')
proxy.all('/*')

proxy.poison(toxy.poisons.latency(1000))
proxy.poison(toxy.poisons.bandwidth({ bps: 1024 }))

const app = express()
app.use(proxy.middleware())

app.listen(3000)
console.log('Server listening on port:', 3000)
