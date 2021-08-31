import { clearCookie } from '../../lib/common.js'

export default async function logout(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/logout',
    handler: onLogout
  })

  async function onLogout(req, reply) {
    const { redis } = this
    await redis.del(req.user.id)
    clearCookie(reply)
    reply.code(204)
  }
}