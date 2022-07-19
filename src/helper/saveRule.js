const ruleConfig = require('../config/rules')
const getRouterByOption = require('./getRouterByOption')
const { checkIncludeObject } = require('./compare')
const DEFAULT_CHAIN = {
  filter: ['FORWARD', 'INPUT', 'OUTPUT'],
  nat: ['FORWARD', 'INPUT', 'OUTPUT', 'PREROUTING', 'POSTROUTING']
}

const saveRule = ({chainName, ruleOrder, options, type, rule}) =>  {
  switch(type) {
    case 'append':
      return handleAppend(chainName, options, rule)
    case 'insert':
      return handleInsert(chainName, ruleOrder, options, rule)
    case 'delete':
      return handleDelete(chainName, ruleOrder, options)
  }
}

const handleAppend = (chainName, options, rule) => {
  let filterRouters = getRouterByOption(options)
  let table = options['table'] || 'filter'
  for (const router of filterRouters) {
    let routerConfig = ruleConfig.get(router.name)
    if (!routerConfig) {
      routerConfig = {}
    }
    if (!routerConfig[table]) {
      if (!Object.keys(DEFAULT_CHAIN).find(key => key == table)) {
        throw new Error(`Invalid table ${table}`)
      }
      routerConfig[table] = {}
    }
    if (!routerConfig[table][chainName]) {
      if (!DEFAULT_CHAIN[table].find(item => item == chainName)) {
        throw new Error(`Invalid chain ${chainName}`)
      }
      routerConfig[table][chainName] = []
    }
    let chain = routerConfig[table][chainName]
    // if (!chain.length) {
      chain.push({
        rule,
        options
      })
    // }
    ruleConfig.set(router.name, routerConfig)
  }
}

const handleInsert = (chainName, ruleOrder, options, rule) => {
  let filterRouters = getRouterByOption(options)
  let table = options['table'] || 'filter'
  for (const router of filterRouters) {
    let routerConfig = ruleConfig.get(router.name)
    if (!routerConfig) {
      routerConfig = {}
    }
    if (!routerConfig[table]) {
      if (!Object.keys(DEFAULT_CHAIN).find(key => key == table)) {
        throw new Error(`Invalid table ${table}`)
      }
      routerConfig[table] = {}
    }
    if (!routerConfig[table][chainName]) {
      if (!DEFAULT_CHAIN[table].find(item => item == chainName)) {
        throw new Error(`Invalid chain ${chainName}`)
      }
      routerConfig[table][chainName] = []
    }
    let chain = routerConfig[table][chainName]
    if (!ruleOrder) {
      chain.unshift({
        rule,
        options
      })
    } else {
      if (ruleOrder - 1 > chain.length) {
        throw new Error('Index of insertion too big.')
      }
      chain.splice(ruleOrder - 1, 0, {
        rule,
        options
      })
    }
    ruleConfig.set(router.name, routerConfig)
  }
}

const handleDelete = (chainName, ruleOrder, options) => {
  let filterRouters = getRouterByOption(options)
  let table = options['table'] || 'filter'
  for (const router of filterRouters) {
    let routerConfig = ruleConfig.get(router.name)
    if (!routerConfig) {
      throw new Error(`No rule in router ${router.name}`)
    }
    if (!routerConfig[table]) {
      throw new Error(`No table ${table} in router ${router.name}`)
    }
    if (!routerConfig[table][chainName]) {
      throw new Error(`No chain ${chain} in table ${table} of router ${router.name}`)
    }
    let chain = routerConfig[table][chainName]
    if (ruleOrder) {
      if (ruleOrder > chain.length) {
        throw new Error('Index of delete too big.')
      } else {
        chain.splice(ruleOrder - 1, 1)
      }
    } else {
      for (let i = 0; i < chain.length; i++) {
        if (checkIncludeObject(chain[i].options, options)) {
          chain.splice(i, 1)
        }
      }
    }
    ruleConfig.set(router.name, routerConfig)
  }
}

module.exports = saveRule