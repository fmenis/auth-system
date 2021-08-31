import t from 'tap'
import Fastify from 'fastify'
import App from '../app.js'

t.test('Login', async t => {
  t.plan(1)

  const fastify = Fastify()
  fastify.register(App)

  const response = await fastify.inject({
    method: 'POST',
    path: '/login',
    payload: {
      email: 'andrea@acme.com',
      password: 'password'
    }
  })

  t.equal(response.statusCode, 204)

  // const cookie = response.cookies.find(item => item.name === 'session')
})

t.test('Status', async t => {
  t.plan(2)

  const fastify = Fastify()
  fastify.register(App)

  let response = await fastify.inject({
    method: 'POST',
    path: '/login',
    payload: {
      email: 'andrea@acme.com',
      password: 'password'
    }
  })

  t.equal(response.statusCode, 204)

  console.log(response.cookies.find(item => item.name === 'session'));

  response = await fastify.inject({
    method: 'GET',
    path: '/status',
    cookies: response.cookies.find(item => item.name === 'session')
  })

  t.equal(response.statusCode, 200)
  t.match(response.json(), { status: 'OK' })
})