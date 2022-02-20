import { app, BrowserWindow, nativeTheme, Tray, Menu } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { Pebeny } from './utils/pebeny';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'));
  }
} catch (_) {}

let tray: Tray | null;
let mainWindow: BrowserWindow | null;
let pebenyWindow: BrowserWindow | null;

const pebeny = new Pebeny();

function createTray() {
  tray = new Tray(path.resolve(__dirname, 'icons/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open main page',
      click: () => {
        if (mainWindow === null) {
          createWindow();
          console.log(process.env.APP_URL);
        }
      },
    },
    {
      label: 'Open Pebeny page',
      click: () => {
        createPebenyWindow();
      },
    },
    {
      label: 'Exit',
      click: () => {
        if (process.platform !== 'darwin') {
          app.quit();
        }
      },
    },
  ]);

  // Call this again for Linux because we modified the context menu
  tray.setContextMenu(contextMenu);
  console.log('Tray!');
}

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        __dirname,
        process.env.QUASAR_ELECTRON_PRELOAD as string
      ),
    },
  });

  mainWindow.loadURL(process.env.APP_URL as string).catch((error) => {
    console.log(error);
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      (mainWindow as BrowserWindow).webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createPebenyWindow() {
  /**
   * Initial window options
   */
  pebenyWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        __dirname,
        process.env.QUASAR_ELECTRON_PRELOAD as string
      ),
    },
    frame: false,
    transparent: true,
  });

  pebenyWindow.loadURL(process.env.APP_URL as string).catch((error) => {
    console.log(error);
  });

  pebenyWindow.webContents.on('did-finish-load', () => {
    console.log('pebenyWindow did-finish-load');
    (pebenyWindow as BrowserWindow).webContents.send('goVRM');
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    pebenyWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    pebenyWindow.webContents.on('devtools-opened', () => {
      (pebenyWindow as BrowserWindow).webContents.closeDevTools();
    });
  }

  pebenyWindow.on('closed', () => {
    pebenyWindow = null;
  });
}

app
  .whenReady()
  .then(() => {
    // set pebeny
    pebeny.setExtension();
    Object.entries(pebeny.extensions).forEach(([extension_id, extension]) => {
      if (extension['activationEvents'].includes('start')) {
        pebeny.startFork(extension);
      }
    });
    pebeny.executeCommand('extension.helloWorld');
    pebeny.executeCommand('extension.helloWorld.dosome');

    createTray();
    createWindow();
  })
  .catch((error) => {
    console.log(error);
  });

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // if (mainWindow === null) {
  //   createWindow();
  // }
});
