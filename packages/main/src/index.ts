import path from 'node:path'
import process from 'node:process'
import { dialog, ipcMain } from 'electron'
import { BrowserWindow, app } from 'electron'
import { ApiEvent, Config } from '@shared/types'
import * as ConfigService from './ConfigService'
import VarPackageService from './VarPackageService'

const isDev = process.env.NODE_ENV !== 'production'

const init = () => {
  const packageService = new VarPackageService()
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
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

  const logCallback =
    (channel: ApiEvent) =>
    (message?: unknown, ...optionalParams: unknown[]) => {
      mainWindow.webContents.send(channel, message, ...optionalParams)
    }

  const attachHandler = (event: ApiEvent) => {
    packageService.on(event, (...args: unknown[]) => {
      mainWindow.webContents.send(event, ...args)
    })
  }

  attachHandler('scan:start')
  attachHandler('scan:stop')
  attachHandler('scan:progress')
  attachHandler('scan:error')

  mainWindow.webContents.once('dom-ready', () => {
    console.log = logCallback('log')
    console.warn = logCallback('log:warn')
    console.error = logCallback('log:err')
  })

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
    const { vamInstallPath } = await ConfigService.getConfig()

    if (vamInstallPath) {
      packageService.scan(vamInstallPath)
    }
  })

  ipcMain.handle('cancelScan', async () => {
    return packageService.cancelScan()
  })

  ipcMain.handle('getPackages', async () => {
    return packageService.getPackages()
  })
}

app
  .whenReady()
  .then(init)
  .catch((err) => {
    console.error((err as Error)?.message)

    process.exit(0)
  })
