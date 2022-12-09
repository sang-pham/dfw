const { checkCredentials } = require('../utils')
const { getNewToken } = require('./api')

const asyncGetScopedTokenByUsername = async (username, password, domain) => {
  domain = domain || 'Default'
  
  const auth_data = {
    auth:{
      identity:{
        methods: ['password'],
        password: {user: {domain: {name: domain}, name: username, password}}
      }
    }
  }

  return getNewToken(auth_data, password)
}

const asyncGetScopedTokenByUserId = async (userId, password, projectId) => {
  const auth_data = {
    auth: {
      identity: {
        methods: ['password'],
        password: {user: {id: userId, password}}
      }
    },
    scope: {
      project: {
        id: projectId
      }
    }
  }

  return getNewToken(auth_data, password)
}

const asyncGetTokenByUsername = async (username, password, domain) => {
  const auth_data = {
    auth:{
      identity:{
        methods: ['password'],
        password: {user: {domain: {name: domain}, name: username, password}}
      }
    }
  }
}

const asyncGetTokenByUserId = async (userId, password) => {
  const auth_data = {
    auth: {
      identity: {
        methods: ['password'],
        password: {user: {id: userId, password}}
      }
    }
  }
}

const authWrapper = async (cb) => {
  try {
    let result = await checkCredentials()
    if (result) {
      cb()
      return
    } else {
      const USERNAME = process.env.USERNAME
      const USERID = process.env.USERID
      const DOMAIN = process.env.DOMAIN
      const PASSWORD = process.env.PASSWORD
      const PROJECT_ID = process.env.PASSWORD
      console.log('get token')
      if (USERNAME) {
        await asyncGetScopedTokenByUsername(USERNAME, PASSWORD, DOMAIN, PROJECT_ID)
      } else if (USERID) {
        await asyncGetScopedTokenByUserId(USERID, PASSWORD, PROJECT_ID)
      } else {
        return
      }
      cb()
      return
    }
  } catch (error) {
    console.log(error.message)
    return
  }
}

module.exports = {
  asyncGetScopedTokenByUsername,
  asyncGetScopedTokenByUserId,
  authWrapper
}