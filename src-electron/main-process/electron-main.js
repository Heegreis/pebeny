/* eslint @typescript-eslint/no-var-requires: "off" */
import { app, BrowserWindow, nativeTheme, Menu, Tray, globalShortcut } from 'electron'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    // import fs = require('fs')
    // import path = require('path')
    // fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
    require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  global.__statics = __dirname
}

let mainWindow
let pebenyWindow

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
  // void pebenyWindow.loadURL(process.env.APP_URL + '/#vrm')
  if (typeof process.env.APP_URL !=='undefined') {
    void pebenyWindow.loadURL(process.env.APP_URL + '/#vrm')
  } else {
    console.log(new TypeError('process.env.APP_URL is undefined'))
  }
  // void pebenyWindow.loadURL(`${String(process.env.APP_URL)}/#vrm`)

  pebenyWindow.on('closed', () => {
    pebenyWindow = null
  })
}

function createTray() {
  let appIcon = null
  appIcon = new Tray('public/icons/favicon-16x16.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open main page', click: () => {
      if (mainWindow === null) {
        createWindow()
        console.log(process.env.APP_URL)
      }
    }},
    { label: 'Open Pebeny page', click: () => {
      createPebenyWindow()
    }}
  ])

  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu)
}

app.on('ready', () => {
  console.log('Electron!')
  globalShortcut.register('F2', () => {
    console.log('Electron loves global shortcuts!')
  })
  createWindow()
  createTray()
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
