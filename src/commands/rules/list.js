const getRouterByOption = require('../../helper/getRouterByOption')
const formatRules = require('../../helper/formatRules')
const fetch = require('node-fetch')

const listRule = async (args, options) => {
  let table = options['table'] || 'filter'
  let routers = []
  try {
    routers = getRouterByOption(options)
  } catch (error) {
    console.log(error.message || error)
  }
  if (!routers.length) return
  for (const router of routers) {
    try {
      const res = await fetch(`http://${router.ip}:${router.port}/rules/${table}${args ? '/' + args  : ''}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': router.key
        }
      })
      if (res.status == 401) {
        throw new Error('Invalid API key')
      }
      const data = await res.json()
      if (res.status == 500) {
        if (data) {
          console.log(data.message)
        }
      } else {
        if (!args) {
          for (const key in data) {
            console.log(`Chain ${key}/${table} in router ${router.name} - ${router.ip}`)
            formatRules(data[key], options)
          }
        } else {
          console.log(`Chain ${args}/${table} in router ${router.name} - ${router.ip}`)
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