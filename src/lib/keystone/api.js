const fetch = require('node-fetch')
const {setUserCache, setToken, getUserCache, getToken, revokeToken} = require('../cache/user.cache')
const { secondDiffTime } = require('../../helper/time')

require('dotenv').config()
const AUTH_URL = process.env.AUTH_URL

const getNewToken = async (body, password) => {
  const response = await fetch(
    AUTH_URL + '/auth/tokens', 
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    }
  )
  if (response.status != 201) {
    await revokeToken()
    throw new Error('Can\'t get token. Try again with your correct credential')
  }
  let data = await response.json()
  data = data['token']
  const {expires_at} = data
  const token = response.headers.get('X-Subject-Token')
  setToken(token, expires_at)
  const newUserData = {
    username: data.user.name,
    userId: data.user.id,
    domain: data.user.domain.name,
    password: password || auth.identity.password.password,
    projectId: data.project.id
  }
  let user = await getUserCache()
  if (user) {
    await setUserCache({
      ...user,
      ...newUserData
    })
  } else {
    await setUserCache(newUserData)
  }
  console.log(await getUserCache())
  console.log(await getToken())
  return {
    success: true,
    value: {token}
  }
}

module.exports = {
  getNewToken
}