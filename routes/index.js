import authenticationPlugin from '../plugins/authentication.js'

import healthRoute from './health.js';
import loginRoute from './login.js';
import logoutRoute from './logout.js';

export default async function index(fastify, opts) {
  fastify.register(authenticationPlugin)
  fastify.register(healthRoute)
  fastify.register(loginRoute)
  fastify.register(logoutRoute)
}