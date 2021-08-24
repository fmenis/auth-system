import Fastify from 'fastify';
import App from './app.js'

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL,
    prettyPrint: process.env.NODE_ENV === 'development'
  },
});

fastify.register(App)

fastify.listen(process.env.SERVER_PORT, err => {
  if (err) {
    fastify.log.fatal(err)
    process.exit(1);
  }
  fastify.log.debug(`Server launched in ${process.env.NODE_ENV} mode`)
});