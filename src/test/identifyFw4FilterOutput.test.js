const utils = require('../lib/utils')
const constant = require('../lib/constant')

const firewalls = [
  {name: 'fw1', ip: '192.168.191.18', port: 5000, network: '192.168.191.0/24'},
  {name: 'fw2', ip: '192.168.191.2', port: 5000, network: '192.168.191.0/28'},
  {name: 'fw3', ip: '192.168.191.3', port: 5000, network: '192.168.191.0/27'},
  {name: 'fw4', ip: '192.168.191.4', port: 5000, network: '192.168.191.0/25'},
  {name: 'fw5', ip: '192.168.191.5', port: 5000, network: '192.168.191.0/26'},
  {name: 'fw6', ip: '192.168.191.6', port: 5000, network: '192.168.191.0/26'},
]

const test1 = () => utils.autoIdentifyFirewalls({
  jump: constant.RULE_ACTION.DROP
}, 'OUTPUT', 'filter', firewalls)

const test2 = () => utils.autoIdentifyFirewalls({
  source: '192.168.191.0/28',
  jump: constant.RULE_ACTION.DROP
}, 'OUTPUT', 'filter', firewalls)

const test3 = () => utils.autoIdentifyFirewalls({
  destination: '192.168.191.4',
  jump: constant.RULE_ACTION.DROP
}, 'OUTPUT', 'filter', firewalls)

const testUtils = () => {
  const obj = {
    test1,
    test2,
    test3
  }
  for (const key in obj) {
    try {
      console.log(`Start ${key}`)
      console.log(`Result of ${key}: ${JSON.stringify(obj[key]())}`)
    } catch (error) {
      console.log(error)
    } finally {
      console.log(`End ${key}\n`)
    }
  }
}

function main() {
  testUtils()
}

main()