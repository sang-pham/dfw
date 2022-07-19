const { exec } = require('child_process')

const validateRule = (rule) => {
  exec('echo "The \\$HOME variable is $HOME"');
}

module.exports = validateRule