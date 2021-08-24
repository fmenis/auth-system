import redis from 'redis'
import Fp from 'fastify-plugin'

async function redisClient(fastify, opts) {
	const client = redis.createClient({
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT
	});

	client.on('error', function (error) {
		fastify.log.error(error);
	});

	client.on('connect', () => {
		fastify.log.debug('Redis client correctly connected')
	})

	function close() {
		return new Promise((resolve, reject) => {
			client.quit(res => {
				resolve()
			})
		});
	}

	function get(key) {
		return new Promise((resolve, reject) => {
			client.get(key, (err, reply) => {
				if (err) {
					return reject(err)
				}
				reply = JSON.parse(reply)
				resolve(reply)
			})
		});
	}

	function set(key, value, opts = {}) {
		return new Promise((resolve, reject) => {
			if (typeof value === 'object') {
				value = JSON.stringify(value);
			}

			const params = [key, value];

			if (opts.setOnlyIfExists) {
				params.push('NX');
			}

			if (opts.setOnlyIfNotExists) {
				params.push('XX');
			}

			if (opts.ttl) {
				params.push('EX', opts.ttl);
			}

			client.set(...params, (err, reply) => {
				if (err) {
					return reject(err)
				}
				resolve(reply)
			})
		});
	}

	function del(key) {
		return new Promise((resolve, reject) => {
			client.unlink(key, (err, value) => {
				if (err) {
					return reject(err);
				}
				resolve(value);
			});
		});
	};

	fastify.decorate('redis', {
		close, get, set, del
	})
}


export default Fp(redisClient)