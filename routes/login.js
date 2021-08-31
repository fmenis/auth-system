import S from 'fluent-json-schema'

import { compareStrings } from '../lib/hash.lib.js'

export default async function login(fastify, opts) {
  const { httpErrors } = fastify;

  fastify.route({
    method: 'POST',
    path: '/login',
    schema: {
      body: S.object()
        .additionalProperties(false)
        .prop('email', S.string().required())
        .prop('password', S.string().minLength(8).required()),
      reponse: {
        200: S.object().prop('token', S.string()),
      }
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

    if (user.isDeleted) {
      log.warn(`[login] invalid access. Login attempt from deleted user ${email} (id: ${user.id})`)
      throw httpErrors.forbidden(`User '${userId}' is deleted`)
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
      createdAt: new Date()
    })

    const cookieOptions = {
      path: '/',
      httpOnly: true,
      signed: true,
      // secure: true,
      // SameSite: 'Lax',
      // domain: 'example.com',
      // maxAge: '',
    }

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true
    }

    reply.setCookie('session', user.id, cookieOptions)

    reply.code(204)
  }
}


