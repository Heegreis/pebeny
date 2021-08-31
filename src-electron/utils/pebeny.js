/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const fs = require('fs')
const path = require('path')
const { fork } = require('child_process')
import { BrowserWindow } from 'electron'

export class Pebeny {
  constructor() {
    this.extensions = {}
    this.commands = {}
    this.extensions_root_path = null
  }

  loadJson(extensions_root_path, extension_name) {
    const json_path = path.resolve(extensions_root_path, extension_name , 'extension.json')
    let rawdata = fs.readFileSync(json_path)
    let json = JSON.parse(rawdata)
    return json
  }
  
  setExtension() {
    this.extensions_root_path = path.resolve(__dirname, '../../extensions')
    if (process.env.PROD) {
      this.extensions_root_path = path.resolve(require('os').homedir(), '.pebeny/extensions/')
    }
    
    const isDirectory = fileName => {
      return fs.lstatSync(fileName).isDirectory()
    }

    const extension_ids = fs.readdirSync(this.extensions_root_path).map(fileName => {
      return path.join(this.extensions_root_path, fileName)
    }).filter(isDirectory).map(dirpath => {
      return path.basename(dirpath)
    })
    
    extension_ids.forEach(extension_id => {
      let extension = this.loadJson(this.extensions_root_path, extension_id)
      extension['floderName'] = extension_id
      extension['activationEvents'].forEach(activationEvent => {
        const eventStr = activationEvent.split(':')
        if (eventStr[0] == 'onCommand') {
          this.registerCommand(eventStr[1], extension_id)
        }
      })
      this.extensions[extension_id] = extension
    })
  }

  startFork(extension) {
    const child_main_path = path.join(this.extensions_root_path, extension['floderName'], extension['main'])
    const child_cwd = path.join(this.extensions_root_path, extension['floderName'])
    const child = fork(child_main_path, {cwd: child_cwd})
    // recvive message from child
    child.on('message', (m) => {
      // m = { action: '動作類型', ...其他參數 }
      if (m['action'] == 'registerCommand') {
        this.registerCommand(m['command'], m['extension_id'])
      }
      if (m['action'] == 'electronKitCreateWindow') {
        this.electronKitCreateWindow(m['pagePath'])
      }
      console.log('parent get message ')
    })
    extension['process'] = child
  }

  registerCommand(command, extension_id) {
    this.commands[command] = { extension_id: extension_id }
    console.log('registerCommand done')
  }

  executeCommand(command) {
    // 如果指令不存在就先fork
    // 指令名稱 配對 對應的child_process
    // 對應的child_process send 觸發 子進程的程式

    if (this.commands[command]) {
      console.log(this.commands[command])
      // 尋找 activationEvents 是指令且符合的
      // 預計寫一個function去搜尋extension
      const extension_id = this.commands[command]['extension_id']
      const extension = this.extensions[extension_id]
      extension['activationEvents'].forEach(activationEvent => {
        const eventStr = activationEvent.split(':')
        if (eventStr[0] == 'onCommand' && eventStr[1] == command) {
          console.log('startFork by command')
          this.startFork(extension)
        }
      })
      console.log('exec start')
      extension['process'].send({
        action: 'executeCommand',
        command: command
      })
      console.log('exec end')
    } else {
      console.log('command not found')
    }
  }

  electronKitCreateWindow(pagePath) {
    /**
     * Initial window options
     */
    let window = new BrowserWindow({
      width: 1000,
      height: 600,
      useContentSize: true,
      // frame: false,
      // transparent: true,
      webPreferences: {
        // Change from /quasar.conf.js > electron > nodeIntegration;
        // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
        nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
        nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,
        webSecurity: false
        // More info: /quasar-cli/developing-electron-apps/electron-preload-script
        // preload: path.resolve(__dirname, 'electron-preload.js')
      }
    })

    void window.loadFile(pagePath)

    window.on('closed', () => {
      window = null
    })
  }
    
}
