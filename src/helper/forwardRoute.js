const getRouterByOption = require('./getRouterByOption')

const forwardRule = (options, rule) => {
  if (!options['routerName'] && !options['routerIp']) {
    console.log(rule)
    return
  }
  try {
    let filterRouters = getRouterByOption(options)
    if (filterRouters.length) {
      console.log(filterRouters.reduce((res, previousValue) => {
        return res + `${previousValue.name}\t\t\t${previousValue.ip}\t\t\t${rule}\n`
      }, "RouterName\t\tRouterIp\t\tRule\n"))
    }
  } catch (error) {
    throw error
  }
}

module.exports = forwardRule