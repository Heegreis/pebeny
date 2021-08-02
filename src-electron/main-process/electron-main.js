/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint @typescript-eslint/no-var-requires: "off" */
// 以上因為此檔為一般js，無法使用typescript的語法，倒致找不到可符合eslint的寫法，所以才禁用
import { app, BrowserWindow, nativeTheme, Menu, Tray, globalShortcut } from 'electron'
const fs = require('fs')
const path = require('path')

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let tray = null
let mainWindow = null
let pebenyWindow = null

function createTray() {
  tray = new Tray(path.resolve(__statics, 'favicon-16x16.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open main page', click: () => {
      if (mainWindow === null) {
        createWindow()
        console.log(process.env.APP_URL)
      }
    }},
    { label: 'Open Pebeny page', click: () => {
      createPebenyWindow()
    }},
    { label: 'Exit', click: () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    }}
  ])

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu)
  console.log('Tray!')
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
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

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })

  void mainWindow.loadURL(process.env.APP_URL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createPebenyWindow () {
  /**
   * Initial window options
   */
  // Menu.setApplicationMenu(null) // 关闭子窗口菜单栏
  pebenyWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    frame: false,
    transparent: true,
    webPreferences: {
      // Change from /quasar.conf.js > electron > nodeIntegration;
      // More info: https://quasar.dev/quasar-cli/developing-electron-apps/node-integration
      nodeIntegration: process.env.QUASAR_NODE_INTEGRATION,
      nodeIntegrationInWorker: process.env.QUASAR_NODE_INTEGRATION,

      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      // preload: path.resolve(__dirname, 'electron-preload.js')
    }
  })
  void pebenyWindow.loadURL(process.env.APP_URL)
  pebenyWindow.webContents.on('did-finish-load', () => {
    pebenyWindow.webContents.send('vrm')
  })
  // void pebenyWindow.loadURL(`${String(process.env.APP_URL)}/#vrm`)

  pebenyWindow.on('closed', () => {
    pebenyWindow = null
  })
}

function loadJson(extensions_root_path, extension_name) {
  const json_path = path.resolve(extensions_root_path, extension_name , 'extension.json')
  let rawdata = fs.readFileSync(json_path)
  let json = JSON.parse(rawdata)
  json['main'] = json['main'].replace(/\.[^/.]+$/, '')
  return json
}

let extensions = []

function setExtension() {
  let extensions_root_path = path.resolve(__dirname, '../../extensions')
  if (process.env.PROD) {
    extensions_root_path = path.resolve(require('os').homedir(), '.pebeny/extensions/')
  }
  
  const isDirectory = fileName => {
    return fs.lstatSync(fileName).isDirectory()
  }

  const extension_names = fs.readdirSync(extensions_root_path).map(fileName => {
    return path.join(extensions_root_path, fileName)
  }).filter(isDirectory).map(dirpath => {
    return path.basename(dirpath)
  })
  
  console.log(extension_names)
  
  extension_names.forEach(extension_name => {
    let extension = loadJson(extensions_root_path, extension_name)
    const module = require(`extensions-dev/${extension_name}/${extension['main']}`)
    extension['activate'] = module.activate
    // extension['activate']()
    extensions.push(extension)
  })
}

app.on('ready', () => {
  console.log('Electron!')
  setExtension()
  // globalShortcut.register('F2', () => {
  //   console.log('Electron loves global shortcuts!')
  // })
  createTray()
  createWindow()

  extensions.forEach(extension => {
    if (extension['activationEvents'].includes('start')) {
      extension['activate']()
    }
  })
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
})

app.on('activate', () => {
  // if (mainWindow === null) {
  //   createWindow()
  // }
})
