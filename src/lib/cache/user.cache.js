// Cache environment variables - if change => revoke user token and other informations
const fs = require('fs')
const path = require('path')

const userJsonPath = path.join(__dirname, '..', '..', 'user.json')
const tokenJsonPath = path.join(__dirname, '..', '..', 'token.json')

const writeFile = async (destPath, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(destPath, data, err => {
      if(err) {
        reject(err)
      } else {
        resolve('Done')
      }
    })
  })
}

const setUserCache = async ({username, domain, userId, password, projectId}) => {
  await writeFile(userJsonPath, JSON.stringify({
    username,
    password,
    domain,
    projectId,
    userId
  }))
}

const getUserCache = async () => {
  if (!fs.existsSync(userJsonPath)) return null
  return new Promise((resolve, reject) => {
    fs.readFile(userJsonPath, (err, data) => {
      if (err) {
        reject(err)
      } else {
        try {
          data = JSON.parse(data)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
    })
  })
}

const isUserConfigChange = async ({username, domain, password, projectId}) => {
  if (!fs.existsSync(userJsonPath)) return true
  let user = await getUserCache()
  if (!user) return true
  else {
    let obj = {username, domain, password, projectId}
    let isChanged = Object.keys(obj).some(key => obj[key] !== user[key])
    return isChanged
  }
}

const revokeToken = async () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(tokenJsonPath, JSON.stringify({}), err => {
      if(err) {
        reject(err)
      } else {
        resolve('Done')
      }
    })
  })
} 

const setToken = async (token, expired_at) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(tokenJsonPath, JSON.stringify({token, expired_at}), err => {
      if(err) {
        reject(err)
      } else {
        resolve('Done')
      }
    })
  })
}

const getToken = async () => {
  if (!fs.existsSync(tokenJsonPath)) return null
  return new Promise((resolve, reject) => {
    fs.readFile(tokenJsonPath, (err, data) => {
      if (err) {
        reject(err)
      } else {
        try {
          data = JSON.parse(data)
          let expired_at = data.expired_at
          let expireTime = new Date(expired_at).getTime()
          let now = Date.now()
          if (now >= expireTime) {
            resolve(null)
          } else {
            resolve(data.token)
          }
        } catch (error) {
          reject(error)
        }
      }
    })
  })
}

module.exports = {
  setUserCache,
  getUserCache,
  isUserConfigChange,
  revokeToken,
  setToken,
  getToken
}