const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')

const updatePolicy = async (chain, newPolicy, options) => {
  const table = options['table'] || 'filter'
  console.log(chain, newPolicy, options)
  try {
    if (!chain) {
      throw new Error('Chain must be specified')
    }
    if (!newPolicy) {
      throw new Error('New policy must be specified')
    }
    const routers = getRouterByOption(options)
    if (!routers.length) return
    for (const router of routers) {
      const res = await fetch(`http://${router.ip}:5000/policy/${table}/${chain}`, {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          policy: newPolicy
        })
      })
      if(res.status == 200) {
        console.log(`Update policy successfully for chain ${chain} in router ${router.name} - ${router.ip}`)
      } else {
        throw new Error('Something is wrong')
      }
    }
  } catch (error) {
    console.log(error?.message || error)
  }
}

module.exports = updatePolicy