const getRouterByOption = require('../../helper/getRouterByOption')
const formatRules = require('../../helper/formatRules')
const fetch = require('node-fetch')
const routerConfig = require('../../config/routers')

const listRule = async (args, options) => {
  let table = options['table'] || 'filter'
  const routers = getRouterByOption(options)
  if (!routers.length) return
  for (const router of routers) {
    try {
      const res = await fetch(`http://${router.ip}:${router.port}/rules/${table}${args ? '/' + args  : ''}`)
      const data = await res.json()
      if (res.status == 500) {
        if (data) {
          console.log(data.message)
        }
      } else {
        if (!args) {
          for (const key in data) {
            console.log(`Chain ${key} in router ${router.name} - ${router.ip}`)
            formatRules(data[key], options)
          }
        } else {
          console.log(`Chain ${args} in router ${router.name} - ${router.ip}`)
          formatRules(data, options)
        }
      }
    } catch (error) {
      if (error.code == 'ECONNREFUSED') {
        console.log(`Unable to connect to the agent at ${router.ip}:${router.port}. Make sure that your agent are running`)
        return
      }
      console.log(error.message)
    }
  }
  return;
}

module.exports = listRule