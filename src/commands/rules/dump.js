const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')
const fs = require('fs')

const dumpRules = async (options) => {
  const routers = getRouterByOption(options)
  const save = options['save']
  const keepTrack = options['c']
  const table = options['table']
  let query = ''
  if (keepTrack) {
    query += 'keep_track=1&'
  }
  if (table) {
    query += `table=${table}`
  }
  if (save) {
    const path = options['path'] || process.cwd() + '/'
    for (const router of routers) {
      console.log(`Start saving rules from firewall ${router.name} - ${router.ip}:${router.port}`)
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/dump-rules?${query}`)
        if (response.status == 200) {
          const data = await response.json()
          await new Promise((resolve, reject) => {
            fs.writeFile(`${path}/${router.name}.txt`, data.data, (err) => {
              if (err) {
                reject(err)
              } else {
                console.log('Save successfully')
                resolve()
              }
            })
          })
        }
      } catch (error) {
        console.log(`Fail to save rules from firewall ${router.name} - ${router.ip}:${router.port}`)
      }
    }
  } else {
    for (const router of routers) {
      console.log(`\nStart dumping rules from firewall ${router.name} - ${router.ip}:${router.port}`)
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/dump-rules?${query}`)
        if (response.status == 200) {
          const data = await response.json()
          let messages = data.data.split('\n').map(item => `\t${item}`).join('\n')
          console.log(messages)
        }
      } catch (error) {
        console.log(`Fail to dump rules from firewall ${router.name}-${router.ip}:${router.port}`)
      }

    }
  }
}

module.exports = {
  dumpRules
}