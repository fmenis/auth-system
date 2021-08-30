export default async function logout(fastify, opts) {
  fastify.route({
    method: 'POST',
    path: '/logout',
    handler: onLogout
  })

  async function onLogout(req, reply) {
    const { redis } = this
    await redis.del(req.user.id)
    reply.clearCookie('session', { path: '/' })
    reply.code(204)
  }
}