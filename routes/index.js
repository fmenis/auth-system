import healthRoute from './health.js';
import loginRoute from './login.js';

export default async function index(fastify, opts) {
  fastify.register(healthRoute)
  fastify.register(loginRoute)
}