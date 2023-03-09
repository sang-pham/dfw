module.exports = {
  DEFAULT_CHAINS: {
    filter: ['INPUT', 'OUTPUT', 'FORWARD'],
    nat: ['INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING'],
    mangle: ['PREROUTING', 'INPUT', 'FORWARD', 'OUTPUT', 'POSTROUTING']
  },
  NETWORK_RELATIONS: {
    SUPERSET: 'SUPERSET',
    SUBSET: 'SUBSET',
    EQUAL: 'EQUAL'
  },
  TARGET: {
    DROP: 'DROP',
    ACCEPT: 'ACCEPT',
    REJECT: 'REJECT'
  },
  IP_CLASSES: {
    PRIVATE_RANGES: [
      {start: '10.0.0.0/8', end: '10.255.255.255/8'},
      {start: '172.16.0.0/16', end: '172.31.255.255/12'},
      {start: '192.168.0.0/24', end: '192.168.255.255/16'}
    ]
  },
  RULE_ACTION: {
    ACCEPT: 'ACCEPT',
    DROP: 'DROP',
    REJECT: 'REJECT'
  },
  IPTABLES_WILDCARDS: ['*.*.*.*', '*.*.*.*/*'],
  IP_REGEX: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
}