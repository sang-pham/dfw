const routerConfig = require('../../config/routers')
const ruleConfig = require('../../config/rules')

let routers = routerConfig.get('routers')

const deleteRouter = (options) => {
  let {ip, name} = options

  if (!routers || !routers.length) {
    return
  }
  if (ip && name) {
    let removeList = routers.filter(item => item.ip === ip && item.name === name)
    if (removeList.length) {
      for (const router of removeList) {
        ruleConfig.delete(router.name)
      }
    }
    routers = routers.filter(item => item.ip !== ip && item.name !== name)
    routerConfig.set('routers', routers)
    return
  }
  if (ip && !name) {
    let removeList = routers.filter(item => item.ip === ip)
    if (removeList.length) {
      for (const router of removeList) {
        ruleConfig.delete(router.name)
      }
    }
    routers = routers.filter(item => item.ip !== ip)
    routerConfig.set('routers', routers)
    return
  }
  if (!ip && name) {
    let removeList = routers.filter(item => item.name === name)
    if (removeList.length) {
      for (const router of removeList) {
        ruleConfig.delete(router.name)
      }
    }
    routers = routers.filter(item => item.name !== name)
    routerConfig.set('routers', routers)
    return
  }
}

module.exports = deleteRouter