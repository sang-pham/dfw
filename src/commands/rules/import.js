const fetch = require('node-fetch')
const getRouterByOption = require('../../helper/getRouterByOption')
const fs = require('fs')

const importRules = async (options) => {
  const path = options['path']
  if (!path) {
    console.log('Path option is required')
    return
  }
  const isExisted = fs.existsSync(path)
  if (!isExisted) {
    console.log(`File ${path} doesn\'t exist`)
    return
  }
  try {
    let fileContent = await new Promise((resolve, reject) => {
      fs.readFile(path, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
    const body = {}
    body.data = fileContent
    if (options['counters']) {
      body.counters = options['counters']
    }
    if (options['table']) {
      body.table = options['table']
    }
    if (options['noflush']) {
      body.noflush = options['noflush']
    }
    const routers = getRouterByOption(options)
    for (const router of routers) {
      console.log(`Start importing rules for firewall ${router.name} - ${router.ip}:${router.port}`)
      try {
        const response = await fetch(`http://${router.ip}:${router.port}/import-rules`, {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(body)
        })
        if (response.status == 200) {
          console.log(`Import rules successfully for firewall ${router.name} - ${router.ip}:${router.port}`)
        }
      } catch (error) {
        console.log(`Fail to import rules for firewall ${router.name} - ${router.ip}:${router.port}`)
      }
    }
  } catch (error) {
    console.log(error.messages)
  }
}

module.exports = importRules