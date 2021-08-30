import Fp from 'fastify-plugin'

async function authentication(fastify, opts) {

  async function hook(req, reply) {
    const { db, redis, httpErrors } = this

    if (req.url === '/login') { //##TODO!!!
      return
    }

    const token = req.cookies.token

    const cookie = req.unsignCookie(token);
    if (!cookie.valid) {
      log.debug(`[authentication] Error: invalid cookie`)
      return httpErrors.unauthorized('Authentication error')
    }

    const userId = cookie.value
    const session = await redis.get(userId)
    if (!session) {
      log.debug(`[authentication] Error: session not found for user '${userId}'`,)
      return httpErrors.unauthorized('Session not found')
    }

    const user = await db.findOne('SELECT * FROM users WHERE id=$1', [userId])
    if (!user) {
      log.debug(`[authentication] Error: user with id '${userId}' not found`,)
      return httpErrors.unauthorized(`User '${userId}' not found`)
    }

    if (user.isDeleted) {
      log.warn(`[authentication] user '${user.id}' is deleted`)
      return httpErrors.forbidden('This user is deleted')
    }

    if (user.isBlocked) {
      log.warn(`[authentication] user '${user.id}' is blocked`)
      return httpErrors.forbidden('This user is blocked by an administrator')
    }

    req.user = user
  }

  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', hook)
}

export default Fp(authentication)