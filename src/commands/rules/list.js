const getRouterByOption = require('../../helper/getRouterByOption')
const formatRules = require('../../helper/formatRules')
const fetch = require('node-fetch')
const ruleConfig = require('../../config/rules')
const routerConfig = require('../../config/routers')

const routers = routerConfig.get('routers')


// const listRule = (args, options) => {
//   if (!routers || !routers.length) {
//     throw new Error('No firewall config yet')
//   }
//   let filterRouters = getRouterByOption(options)
//   let table = options['table'] || 'filter'
//   for (const router of filterRouters) {
//     let routerRules = ruleConfig.get(router.name)
//     if (table) {
//       if(!routerRules[table]) {
//         throw new Error(`Router ${router.ip} doesn't have table ${table}`)
//       } else {
//         routerRules = routerRules[table]
//         if (args) {
//           if (routerRules[args]) {
//             routerRules = routerRules[args]
//           } else {
//             throw new Error(`Table ${table} in router ${router.name}-${router.ip} doesn't have chain ${args}`)
//           }
//         }
//       }
//     }
//     console.log(`Router ${router.name} - ${router.ip}`)
//     if (!args) {
//       for (const chain in routerRules) {
//         console.log(`\tChain: ${chain}`)
//         let idx = 0;
//         for (const rule of routerRules[chain]) {
//           if (options['lineNumbers']) {
//             console.log(`\t\t${++idx}. ${rule.rule}`)
//           } else {
//             console.log(`\t\t${rule.rule}`)
//           }
//         }
//       }
//     } else {
//       console.log(`\tChain: ${args}`)
//       let idx = 0;
//       for (const rule of routerRules) {
//         if (options['lineNumbers']) {
//           console.log(`\t\t${++idx}. ${rule.rule}`)
//         } else {
//           console.log(`\t\t${rule.rule}`)
//         }
//       }
//     }
//   }
// }

const listRule = async (args, options) => {
  let table = options['table'] || 'filter'
  const routers = getRouterByOption(options)
  if (!routers.length) return
  try {
    for (const router of routers) {
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
            // console.log('\n')
          }
        } else {
          console.log(`Chain ${args} in router ${router.name} - ${router.ip}`)
          formatRules(data, options)
        }
      }
    }
  } catch (error) {
    console.log(error)
  }
  return;
}

module.exports = listRule