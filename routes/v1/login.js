import S from 'fluent-json-schema'
import moment from 'moment'

import { compareStrings } from '../../lib/hash.js'

export default async function login(fastify, opts) {
  const { httpErrors } = fastify;

  fastify.route({
    method: 'POST',
    path: '/login',
    config: {
      public: true
    },
    schema: {
      body: S.object()
        .additionalProperties(false)
        .prop('email', S.string().required())
        .prop('password', S.string().minLength(8).required())
    },
    handler: onLogin
  })

  async function onLogin(req, reply) {
    const { email, password } = req.body
    const { db, log, redis } = this

    const user = await db.findOne('SELECT * FROM users WHERE email=$1', [email])
    if (!user) {
      log.debug(`[login] invalid access. User with email ${email} not found`)
      throw httpErrors.unauthorized('Invalid email or password')
    }

    if (user.isBlocked) {
      log.warn(`[login] invalid access. Login attempt from blocked user ${email} (id: ${user.id})`)
      throw httpErrors.forbidden(`User '${userId}' is blocked by an administrator`)
    }

    const match = await compareStrings(password, user.password)
    if (!match) {
      log.debug(`[login] invalid access. Password for user ${email} does not match`)
      throw httpErrors.unauthorized('Invalid email or password')
    }

    await redis.set(user.id, {
      userId: user.id,
      email: user.email,
      createdAt: new Date(),
      isValid: true
    }, { ttl: fastify.config.SESSION_TTL })

    const cookieOptions = {
      path: '/api',
      httpOnly: true,
      signed: true,
      SameSite: 'Lax',
      domain: 'localhost',
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Date
      expire: moment().add(6, 'months').toDate().toUTCString()
    }

    if (fastify.config.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    reply.setCookie('session', user.id, cookieOptions)

    reply.code(204)
  }
}
