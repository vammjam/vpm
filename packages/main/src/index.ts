import path from 'node:path'
import { dialog, ipcMain } from 'electron'
import { BrowserWindow, app } from 'electron'
import { Config } from '@shared/types'
import * as ConfigService from './ConfigService'
import * as VarPackageService from './VarPackageService'

const isDev = process.env.NODE_ENV !== 'production'

const init = () => {
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 600,
    webPreferences: {
      nodeIntegration: false, // default in Electron >= 5
      contextIsolation: true, // default in Electron >= 12
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // mainWindow.loadFile('index.html')
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })

    return canceled ? undefined : filePaths[0]
  })

  ipcMain.handle('getConfig', async () => {
    return ConfigService.getConfig()
  })

  ipcMain.handle('saveConfig', async (_, config: Partial<Config>) => {
    return ConfigService.saveConfig(config)
  })

  ipcMain.handle('scan', async () => {
    const { vamInstallPath: vamRootPath } = await ConfigService.getConfig()

    if (vamRootPath) {
      await VarPackageService.scan(vamRootPath)
    }
  })
}

app
  .whenReady()
  .then(init)
  .catch((err) => {
    console.error((err as Error)?.message)

    process.exit(0)
  })
