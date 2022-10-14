#! /usr/bin/env node

// const commander = require('commander')
// const program = new commander.Command()
const { program } = require('commander');
const addRouter = require('./src/commands/router/add')
const listsRouter = require('./src/commands/router/list')
const deleteRouter = require('./src/commands/router/delete')
const flushRouter = require('./src/commands/router/flush')
const { updateRouterPort } = require('./src/commands/router/update')

const appendRule = require('./src/commands/rules/append')
const deleteRule = require('./src/commands/rules/delete')
const insertRule = require('./src/commands/rules/insert')
const listRule = require('./src/commands/rules/list')

const newChain = require('./src/commands/chains/new')
const deleteChain = require('./src/commands/chains/delete')

const getPolicy = require('./src/commands/policies/get')
const updatePolicy = require('./src/commands/policies/update')

const addCommand = program
  .command('add')
  .description('Use help for more options with add')

addCommand
  .command('router')
  .description('Add new router')
  .option('-n, --name <string>', 'router unique name')
  .option('-ip, --ip <string>', 'router unique ip')
  .option('-p, --port <number>', 'port that the agent will run on')
  .option('--router-sync <string>', 'sync rule from a router or list of routers seperated by comma')
  .option('--table-sync <string>', 'list of tables for sync rules seperated by comma or ignore for sync all tables')
  .option('--chain-sync <string>', 'list of default chains for sync rules seperated by comma or ignore for sync all tables')
  .action(addRouter)

addCommand
  .command('chain')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-rn, --router-name <string>', 'router to add chain')
  .action(newChain)


const listCommand = program
  .command('list')
  .description('Use help for more options with list')

listCommand
  .command('router')
  .description('List config routers')
  .option('-n, --name <string>', 'exact router name')
  .option('-ip, --ip <string>', 'exact router ip')
  .action(listsRouter)

const deleteCommand = program
  .command('delete')
  .description('Use help for more options with delete')

deleteCommand
  .command('router')
  .description('Delete router')
  .option('-n, --name <string>', 'exact router name')
  .option('-ip, --ip <string>', 'exact router ip')
  .action(deleteRouter)

deleteCommand
  .command('chain')
  .argument('<chainName>')
  .option('-t, --table <string>', 'table to add chain (default: \`filter\`)')
  .option('-rn, --router-name <string>', 'router to add chain')
  .action(deleteChain)

const flushCommand = program
  .command('flush')
  .description('Use help for more options with flush')

flushCommand
  .command('router')
  .description('Flush all router config')
  .action(flushRouter)

// program.option('-j, --jump')

function loadRuleOption(command) {
  command.option('-j, --jump <string>', 'target for rule (may load target extension)')
  command.option('-p, --protocol <string>', 'protocol: by name, eg. \`tcp\`')
  command.option('-s, --source <string>', 'source specification: list of address[/mask][...] separated by comma')
  command.option('-d, --destination <string>', 'destination specification: list of address[/mask][...] separated by comma')
  command.option('-sport, --source-port <string>', 'source port number specification')
  command.option('-dport, --destination-port <string>', 'source port number specification')
  command.option('-i, --in-interface <string>', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-o, --out-interface <string>', 'network interface name ([+] for wildcard) or list separate by comma')
  command.option('-t, --table <string>', 'table to manipulate (default: \`filter\`)')
  command.option('-rn, --router-name <string>', 'List of router by name that rule will be sent to')
  command.option('-rip, --router-ip <string>', 'List of router by ip that rule will be sent to')
}

const appendRuleCommand = program
  .command('A')
  .description('Append rule to specific chain')
  .argument('<chain>')
  .action(appendRule)

loadRuleOption(appendRuleCommand)

const deleteRuleCommand = program
  .command('D')
  .description('Delete rule from specific chain')
  .argument('<chain>')
  .argument('[rule-order]', 'Optional rule order, value 0 means delete all rules in chain')
  .action(deleteRule)

loadRuleOption(deleteRuleCommand)

const insertRuleCommand = program
  .command('I')
  .description('Insert rule to specific chain')
  .argument('<chain>')
  .argument('[rule-order]')
  .action(insertRule)

loadRuleOption(insertRuleCommand)

const listRuleCommand = program
  .command('L')
  .description('List all rule. Options: by router/table/chain')
  .argument('[chain]')
  .option('-rn, --router-name <string>', 'List of rule in router by name')
  .option('-rip, --router-ip <string>', 'List of rule in router by ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .option('--line-numbers', 'List with rule order')
  .action(listRule)

const getCommand = program.command('get').description('Use -h for more information for get command')

getCommand
  .command('policy')
  .description('Get policy from specific chain')
  .argument('<chain>')
  .option('-rn, --router-name <string>', 'exact router name')
  .option('-rip, --router-ip <string>', 'exact router ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .action(getPolicy)

const updateCommand = program.command('update').description('Use -h for more information for update command')

updateCommand
  .command('policy')
  .description('Update policy for specific chain')
  .argument('<chain>')
  .argument('<new-policy>')
  .option('-rn, --router-name <string>', 'exact router name')
  .option('-rip, --router-ip <string>', 'exact router ip')
  .option('-t, --table <string>', 'List of rule in table (default: \`filter\`)')
  .action(updatePolicy)

updateCommand
  .command('router')
  .description('Update configuration for specific router')
  .option('-rn, --router-name <string>', 'exact router name need to update')
  .option('-rip, --router-ip <string>', 'exact router ip need to update')
  .option('-p, --port <number>', 'new port that agent will run on')
  .action(updateRouterPort)

try {
  program.parse();
} catch (err) {
  if (err) {
    console.log(err.message)
  }
}