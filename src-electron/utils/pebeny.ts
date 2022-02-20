import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { ChildProcess, fork } from 'child_process';
import { BrowserWindow } from 'electron';

interface Extension {
  name: string;
  displayName: string;
  description: string;
  version: string;
  publisher: string;
  repository: string;
  // "engines": {
  //     "vscode": "^1.51.0"
  // },
  engines: object;
  // "activationEvents": [
  //     "start"
  // ],
  activationEvents: string[];
  main: string;
  floderName: string;
  process: ChildProcess;
}

interface Extensions {
  [key: string]: Extension;
}

interface ExtensionProcessActionMessage {
  action: string;
  command: string;
  extension_id: string;
  pagePath: string;
}

interface Command {
  extension_id: string;
}

interface Commands {
  [key: string]: Command;
}

export class Pebeny {
  extensions: Extensions;
  commands: Commands;
  extensions_root_path: string;

  constructor() {
    this.extensions = {};
    this.commands = {};
    this.extensions_root_path = '';
  }

  loadJson(extensions_root_path: string, extension_name: string) {
    const json_path = path.resolve(
      extensions_root_path,
      extension_name,
      'extension.json'
    );
    const rawdata = fs.readFileSync(json_path);
    const json = JSON.parse(rawdata.toString()) as Extension;
    return json;
  }

  setExtension() {
    this.extensions_root_path = path.resolve(__dirname, '../../extensions');
    if (process.env.PROD) {
      this.extensions_root_path = path.resolve(
        homedir(),
        '.pebeny/extensions/'
      );
    }

    const isDirectory = (fileName: string) => {
      return fs.lstatSync(fileName).isDirectory();
    };

    const extension_ids = fs
      .readdirSync(this.extensions_root_path)
      .map((fileName) => {
        return path.join(this.extensions_root_path, fileName);
      })
      .filter(isDirectory)
      .map((dirpath) => {
        return path.basename(dirpath);
      });

    extension_ids.forEach((extension_id) => {
      const extension = this.loadJson(this.extensions_root_path, extension_id);
      extension['floderName'] = extension_id;
      extension['activationEvents'].forEach((activationEvent) => {
        const eventStr = activationEvent.split(':');
        if (eventStr[0] == 'onCommand') {
          this.registerCommand(eventStr[1], extension_id);
        }
      });
      this.extensions[extension_id] = extension;
    });
  }

  startFork(extension: Extension) {
    const child_main_path = path.join(
      this.extensions_root_path,
      extension['floderName'],
      extension['main']
    );
    const child_cwd = path.join(
      this.extensions_root_path,
      extension['floderName']
    );
    const child = fork(child_main_path, { cwd: child_cwd });
    // recvive message from child
    child.on('message', (m: ExtensionProcessActionMessage) => {
      // m = { action: '動作類型', ...其他參數 }
      if (m['action'] == 'registerCommand') {
        this.registerCommand(m['command'], m['extension_id']);
      }
      if (m['action'] == 'electronKitCreateWindow') {
        this.electronKitCreateWindow(m['pagePath']);
      }
      console.log('parent get message ');
    });
    extension['process'] = child;
  }

  // command_id 是  extension 的 檔名
  // command 是 "activationEvents": [
  //   "onCommand:extension.helloWorld"
  // ] 的 extension.helloWorld

  registerCommand(command: string, extension_id: string) {
    this.commands[command] = { extension_id: extension_id } as Command;
    console.log('registerCommand done');
  }

  executeCommand(command: string) {
    // 如果指令不存在就先fork
    // 指令名稱 配對 對應的child_process
    // 對應的child_process send 觸發 子進程的程式

    if (this.commands[command]) {
      console.log(this.commands[command]);
      // 尋找 activationEvents 是指令且符合的
      // 預計寫一個function去搜尋extension
      const extension_id = this.commands[command]['extension_id'];
      const extension = this.extensions[extension_id];
      extension['activationEvents'].forEach((activationEvent) => {
        const eventStr = activationEvent.split(':');
        if (eventStr[0] == 'onCommand' && eventStr[1] == command) {
          console.log('startFork by command');
          this.startFork(extension);
        }
      });
      console.log('exec start');
      extension['process'].send({
        action: 'executeCommand',
        command: command,
      });
      console.log('exec end');
    } else {
      console.log('command not found');
    }
  }

  electronKitCreateWindow(pagePath: string) {
    /**
     * Initial window options
     */
    let window: BrowserWindow | null;
    window = new BrowserWindow({
      width: 1000,
      height: 600,
      useContentSize: true,
      // frame: false,
      // transparent: true,
      webPreferences: {
        contextIsolation: true,
        // More info: /quasar-cli/developing-electron-apps/electron-preload-script
        // preload: path.resolve(
        //   __dirname,
        //   process.env.QUASAR_ELECTRON_PRELOAD as string
        // ),
      },
    });

    void window.loadFile(pagePath);

    window.on('closed', () => {
      window = null;
    });
  }
}
