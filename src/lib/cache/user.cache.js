// Cache environment variables - if change => revoke user token and other informations

const redisClient = require('../redis')

const setUserCache = async ({username, domain, userId, password, projectId}) => {
  await redisClient.set('user', JSON.stringify({
    username,
    password,
    domain,
    projectId,
    userId
  }))
}

const getUserCache = async () => await redisClient.get('user')

const isUserConfigChange = async ({username, domain, password, projectId}) => {
  let user = await redisClient.get('user')
  if (!user) return true
  else {
    user = JSON.parse(user)
    let obj = {username, domain, password, projectId}
    let isChanged = Object.keys(obj).some(key => obj[key] !== user[key])
    return isChanged
  }
}

const revokeToken = async () => await redisClient.del('token') 

const setToken = async (token, ttl) => await redisClient.set('token', token, {
  EX: ttl || 3600
})

const getToken = async () => await redisClient.get('token')

module.exports = {
  setUserCache,
  getUserCache,
  isUserConfigChange,
  revokeToken,
  setToken,
  getToken
}