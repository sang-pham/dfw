const utils = require('../lib/utils')
const constant = require('../lib/constant')

const firewalls = [
  {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'},
  {name: 'fw2', ip: '192.168.191.2', port: 5000, network: '192.168.191.0/28'},
  {name: 'fw3', ip: '192.168.191.3', port: 5000, network: '192.168.191.0/27'},
  {name: 'fw4', ip: '192.168.191.4', port: 5000, network: '192.168.191.0/25'},
  {name: 'fw5', ip: '192.168.191.5', port: 5000, network: '192.168.191.0/26'},
  {name: 'fw6', ip: '192.168.191.6', port: 5000, network: '192.168.191.0/26'},
]

const test1 = () => utils.autoIdentifyFirewalls({
  source: '192.168.191.0/26',
  jump: constant.RULE_ACTION.DROP
}, 'FORWARD', 'filter', firewalls)

const test2 = () => utils.autoIdentifyFirewalls({
  destination: '192.168.191.0/25',
  jump: constant.RULE_ACTION.DROP
}, 'FORWARD', 'filter', firewalls)

const test3 = () => utils.autoIdentifyFirewalls({
  source: '192.168.191.10',
  destination: '192.168.191.253',
  jump: constant.RULE_ACTION.DROP
}, 'FORWARD', 'filter', firewalls)

const testUtils = () => {
  const obj = {
    1: test1,
    2: test2,
    3: test3
  }
  for (const key in obj) {
    try {
      console.log(`Start test ${key}`)
      console.log(`Result of test ${key}: ${JSON.stringify(obj[key]())}`)
    } catch (error) {
      console.log(error)
    } finally {
      console.log(`End test ${key}\n`)
    }
  }
}

function main() {

  testUtils()
}

main()