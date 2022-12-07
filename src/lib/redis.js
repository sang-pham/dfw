const { createClient } = require('redis')
require('dotenv').config()
const REDIS_HOST = process.env.REDIS_HOST
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

const redisClient = createClient({
  url: `redis://${REDIS_HOST}`,
  password: REDIS_PASSWORD
})

redisClient.on('error', err => console.log('Redis client has trouble! Check your connection to the redis server'))

module.exports = redisClient