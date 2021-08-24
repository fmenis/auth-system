import pg from 'pg'
import Fp from 'fastify-plugin'

async function postgresClient(fastify, opts) {
	const pool = new pg.Pool({
		user: process.env.PG_USER,
		host: process.env.PG_HOST,
		database: process.env.PG_DB,
		password: process.env.PG_PW,
		port: process.env.PG_PORT
	})

	pool.query('SELECT NOW()', (err, res) => {
		if (err) {
			return console.error(error);
		}
		fastify.log.debug('Postgres client correctly connected')
	})

	pool.on('error', (err, client) => {
		fastify.log.error(err)
	});

	function execQuery(query, inputs = [], client = pool) {
		return new Promise((resolve, reject) => {
			client.query(query, inputs, (err, reply) => {
				if (err) {
					return reject(err);
				}
				resolve(reply);
			});
		});
	}

	async function findOne(query, inputs) {
		const reply = await execQuery(query, inputs)
		return reply.rows[0]
	}

	fastify.decorate('db', {
		execQuery, findOne
	})
}

export default Fp(postgresClient)
