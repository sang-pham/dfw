const { isUserConfigChange, getUserCache, getToken } = require('./cache/user.cache')
const config = require('../../config.json')
require('dotenv').config()

const checkEnv = () => {
  const AUTH_URL = config['auth_url']
  const USERNAME = config['username']
  const USERID = config['user_id']
  const DOMAIN = config['domain']
  const PASSWORD = config['password']
  const PROJECT_ID = config['project_id']
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
      username: config['username'],
      userId: config['user_id'],
      password: config['password'],
      domain: config['domain'],
      projectId: config['project_id']
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