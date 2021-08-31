import Fp from 'fastify-plugin'
import cookie from 'fastify-cookie'


async function authentication(fastify, opts) {
  fastify.register(cookie, {
    secret: process.env.SECRET
  })

  async function authenticate(req, reply) {
    const { db, redis, httpErrors, log } = this

    // public routes
    if (reply.context?.config?.public) {
      return
    }
  
    const cookie = req.cookies.session
    if (!cookie) {
      log.debug(`[authentication] Error: cookie not found`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const unsignedCookie = req.unsignCookie(cookie);
    if (!unsignedCookie.valid) {
      log.debug(`[authentication] Error: invalid cookie`)
      throw httpErrors.unauthorized('Authentication error')
    }

    const userId = unsignedCookie.value
    const session = await redis.get(userId)
    if (!session) {
      log.debug(`[authentication] Error: session not found for user '${userId}'`,)
      throw httpErrors.unauthorized('Session not found')
    }

    const user = await db.findOne('SELECT * FROM users WHERE id=$1', [userId])
    if (!user) {
      log.debug(`[authentication] Error: user with id '${userId}' not found`,)
      throw httpErrors.unauthorized(`User '${userId}' not found`)
    }

    if (user.isDeleted) {
      log.warn(`[authentication] user '${user.id}' is deleted`)
      throw httpErrors.forbidden('This user is deleted')
    }

    if (user.isBlocked) {
      log.warn(`[authentication] user '${user.id}' is blocked`)
      throw httpErrors.forbidden('This user is blocked by an administrator')
    }

    req.user = user
  }

  fastify.decorateRequest('user', null)
  fastify.addHook('onRequest', authenticate)
}

export default Fp(authentication)