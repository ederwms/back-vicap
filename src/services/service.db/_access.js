const { Pool } = require('pg')

const DB_HOST = process.env.DB_HOST
const DB_DATABASE = process.env.DB_DATABASE
const DB_USER = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_PORT = process.env.DB_PORT
const DB_MAX_CONNECTIONS = process.env.DB_MAX_CONNECTIONS || 1

const pool = new Pool({
  host: DB_HOST,
  database: DB_DATABASE,
  user: DB_USER,
  password: DB_PASSWORD,
  port: DB_PORT,
  max: DB_MAX_CONNECTIONS
})

const query = async (sql, params = []) => {
  const result = await pool.query(sql, params)

  return result.rows
}

const queryFirstOrDefault = async (sql, params = []) => {
  const result = await pool.query(sql, params)

  if (result.rowCount > 0) {
    return result.rows[0]
  }

  return null
}

const insertOrUpdate = async (sql, params = []) => {
  const result = await pool.query(sql, params)

  return result.rows[0]
}

const getClient = async () => {
  const client = await pool.connect()

  return client
}

module.exports = {
  query,
  queryFirstOrDefault,
  insertOrUpdate,
  getClient
}
