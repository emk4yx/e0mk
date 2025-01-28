import mariadb from 'mariadb';
import config from '../config.js';

export class Database {
	constructor() {
		this.pool = null;
		this.ns = 'tb';
	}

	async initialize() {
		this.pool = mariadb.createPool({
			user: config.db.user,
			password: config.db.pass,
			database: config.db.name,
			host: config.db.host,
		});
	}

	async query(queryParam, params = []) {
		const connection = await this.pool.getConnection();

		let result;
		try {
			result = await connection.query(queryParam, params);
		} catch (e) {
			bot.log.error(e);
		} finally {
			await connection.release();
		}

		return result || [];
	}

	async queryOne(queryStr, params = [], addLimit = true) {
		const result = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
		return result?.[0] || false;
	}

	async entryExists(queryStr, params = [], addLimit = true) {
		const rows = await this.query(`${queryStr}${addLimit ? ' LIMIT 1' : ''}`, params);
		return rows.length > 0;
	}
	async getDatabaseUptime() {
		const result = await this.query('SHOW STATUS LIKE "Uptime"');
		return result[0]?.Value || 'N/A';
	  }
}