const { isUserConfigChange, getUserCache, getToken } = require('./cache/user.cache')
require('dotenv').config()

const checkEnv = () => {
  const AUTH_URL = process.env.AUTH_URL
  const USERNAME = process.env.USERNAME
  const USERID = process.env.USERID
  const DOMAIN = process.env.DOMAIN
  const PASSWORD = process.env.PASSWORD
  const PROJECT_ID = process.env.PASSWORD
  if (!AUTH_URL) {
    throw new Error('You must specify the AUTH_URL variable')
  }
  if (!PASSWORD) {
    throw new Error('You must specify your password')
  }
  if ((!USERID || !PROJECT_ID) && (!USERNAME || !DOMAIN)) {
    throw new Error('You must specify user ID and project ID or user name and domain')
  }
}

const checkCredentials = async () => {
  try {
    checkEnv()
    let obj = {
      username: process.env.USERNAME,
      userId: process.env.USERID,
      password: process.env.PASSWORD,
      domain: process.env.DOMAIN,
      projectId: process.env.PROJECT_ID
    }
    let token = await getToken()
    let isConfigChange = await isUserConfigChange(obj)
    let userCache = await getUserCache()
    if (isConfigChange|| !userCache || !token) return false
    return true
  } catch (error) {
    throw error
  }
}

module.exports = {
  checkCredentials,
  checkEnv
}