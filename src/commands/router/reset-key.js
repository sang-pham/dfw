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
    let key = await new Promise((resolve, reject) => {
      bcrypt.hash(new Date().toString(), constant.SALT_ROUNDS, (err, hash) => {
        if (err) {
          reject(err)
        } else {
          resolve(hash)
        }
      })
    })
    for (const router of matchRouters) {
      let foundRouter = routers.find(_r => _r.name === router.name)
      foundRouter.key = key
      console.log(`Generate new key for firewall ${router.name}: ${key}`)
    }
    routerConfig.set('routers', routers)
  } catch (error) {
    console.log(error.message || error)
  }
}

module.exports = resetKey