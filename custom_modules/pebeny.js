/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const path = require('path')


const pebeny = {
  commands: {
    registerCommand: function (command, func) {
      const extension_id = path.basename(process.execPath)
      process.send({
        action: 'registerCommand',
        command: command,
        extension_id: extension_id
      })
      // { command, extension_id }
      process.on('message', (m) => {
        // m = { action: '動作類型', ...其他參數 }
        if (m['action'] == 'executeCommand') {
          if (m['command'] == command) {
            func()
          }
        }
        console.log('child got message:', m);
      })
    }
  },
  electronKitCreateWindow: function (pagePath) {
    pagePath = path.resolve(process.cwd(), pagePath)
    process.send({
      action: 'electronKitCreateWindow',
      pagePath: pagePath
    })
  }
}

module.exports = pebeny