import authenticationPlugin from '../plugins/authentication.js'
import v1 from './v1/index.js'

export default async function index(fastify, opts) {
  fastify.register(authenticationPlugin)
  fastify.register(v1, { prefix: '/v1' })
}