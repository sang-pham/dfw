const utils = require('../lib/utils')

function main() {
  const firewalls = [
    {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/24'},
    {name: 'fw1', ip: '192.168.191.1', port: 5000, network: '192.168.191.0/23'},
  ]

  const network = '192.168.191.0/23'
  console.log(utils.getSupersetNet(network, firewalls))

}

main()