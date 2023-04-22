const routerConfig = require('../../config/routers')
const getRouterByOption = require('../../helper/getRouterByOption')
const constant = require('../../lib/constant')
const bcrypt = require('bcrypt')

let routers = routerConfig.get('routers')

const resetKey = async (options) => {
  try {
    const matchRouters = getRouterByOption(options)
    if (!matchRouters.length) {
      console.log("No firewall matches with options")
      return
    }
    for (const router of matchRouters) {
      let key = await new Promise((resolve, reject) => {
        bcrypt.hash(`${router.name}-${router.ip}`, constant.SALT_ROUNDS, (err, hash) => {
          if (err) {
            reject(err)
          } else {
            resolve(hash)
          }
        })
      })
      router.key = key
      console.log(`Generate new key for firewall ${router.name}: ${key}`)
    }
    routerConfig.set('routers', routers)
  } catch (error) {
    console.log(error.message || error)
  }
}

module.exports = resetKey