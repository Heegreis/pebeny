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
import { Pebeny } from '../utils/pebeny'

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

const pebeny = new Pebeny()

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

app.on('ready', () => {
  console.log('Electron!')
  pebeny.setExtension()
  // globalShortcut.register('F2', () => {
  //   console.log('Electron loves global shortcuts!')
  // })
  createTray()
  createWindow()

  Object.entries(pebeny.extensions).forEach(([extension_id, extension]) => {
    if (extension['activationEvents'].includes('start')) {
      pebeny.startFork(extension)
    }
  })

  pebeny.executeCommand('extension.helloWorld')
  pebeny.executeCommand('extension.helloWorld.dosome')
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
