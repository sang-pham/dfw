const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const getPolicy = async (args, options) => {
  try {
    if(!args) {
      throw new Error('Chain must be specified')
    }
    let table = options['table'] || 'filter'
    const routers = getRouterByOption(options)
    if (!routers.length) return
    for (const router of routers) {
      const res = await fetch(`http://${router.ip}:${router.port}/policy/${table}/${args}`)
      const data = await res.json()
      if (res.status == 500) {
        if (data) {
          console.log(data.message)
        }
      } else {
        console.log(`Chain ${args}'s policy in router ${router.name} - ${router.ip}: ${data.policy}`)
      }
    }
  } catch (error) {
    if(error) console.log(error.message)
    else console.log('Something wrong')
  }
}

module.exports = getPolicy