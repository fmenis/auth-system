import Sensible from 'fastify-sensible'
import Jwt from 'fastify-jwt'
import cookie from 'fastify-cookie'
import helmet from 'fastify-helmet'
import cors from 'fastify-cors'

import apiPlugin from './routes/index.js'

import pgPlugin from './plugins/postgres.js'
import redisPlugin from './plugins/redis.js'
// import authPlugin from './plugins/authentication.js'

export default async function app(fastify, opts) {
  fastify.register(Sensible)
  fastify.register(Jwt, {
    secret: process.env.SECRET
  })
  fastify.register(cookie, {
    secret: process.env.SECRET
  })

  fastify.register(helmet)
  fastify.register(cors)


  fastify.register(pgPlugin)
  fastify.register(redisPlugin)
  fastify.register(apiPlugin)
}
