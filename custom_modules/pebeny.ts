// 這是給 extention 呼叫的 api，開發者要用安裝套件的方式去使用
// npx tsc custom_modules/pebeny.ts -w

import * as path from 'path';

interface ExtensionProcessActionMessage {
  action: string;
  command: string;
  // extension_id: string;
  // pagePath: string;
}

const pebeny = {
  commands: {
    registerCommand: function (command: string, func: () => void) {
      const extension_id = path.basename(process.execPath);
      // if (process.send) {
      //   process.send({
      //     action: 'registerCommand',
      //     command: command,
      //     extension_id: extension_id
      //   })
      // }
      process.send?.({
        action: 'registerCommand',
        command: command,
        extension_id: extension_id,
      });
      // { command, extension_id }
      process.on('message', (m: ExtensionProcessActionMessage) => {
        // m = { action: '動作類型', ...其他參數 }
        if (m['action'] == 'executeCommand') {
          if (m['command'] == command) {
            func();
          }
        }
        console.log('child got message:', m);
      });
    },
  },
  electronKitCreateWindow: function (pagePath: string) {
    pagePath = path.resolve(process.cwd(), pagePath);
    process.send?.({
      action: 'electronKitCreateWindow',
      pagePath: pagePath,
    });
  },
};

module.exports = pebeny;
