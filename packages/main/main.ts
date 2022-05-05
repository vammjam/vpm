import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app, dialog, ipcMain } from 'electron'
import { ApiEvent, Config } from '@shared/types'
import wait from '@shared/utils/wait'
import AddonPackageService from '~/services/AddonPackageService'
import ConfigService from '~/services/ConfigService'

const isDev = process.env.NODE_ENV !== 'production'

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    height: 800,
    width: 1200,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1c1c1c',
      symbolColor: '#65d4e7',
    },
    webPreferences: {
      nodeIntegration: false, // default in Electron >= 5
      contextIsolation: true, // default in Electron >= 12
      // turned on, ONLY in DEV, to allow loading of local
      // files (images) when using the dev server
      webSecurity: isDev ? false : true,
      nodeIntegrationInWorker: true, // multi-threading!
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    wait(1).then(() => {
      mainWindow.webContents.openDevTools()
    })
  } else {
    // mainWindow.loadFile('index.html')
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
  }

  const logCallback = (channel: ApiEvent) => {
    return (message?: unknown, ...optionalParams: unknown[]) => {
      mainWindow.webContents.send(channel, message, ...optionalParams)
    }
  }

  const onReady = () => {
    console.log = logCallback('log:info')
    console.warn = logCallback('log:warn')
    console.error = logCallback('log:err')
  }

  mainWindow.webContents.once('dom-ready', onReady)

  const addonPackageService = new AddonPackageService()

  const attachScanEvents = (event: ApiEvent) => {
    addonPackageService.on(event, (...args: unknown[]) => {
      mainWindow.webContents.send(event, ...args)
    })
  }

  attachScanEvents('scan:start')
  attachScanEvents('scan:stop')
  attachScanEvents('scan:progress')
  attachScanEvents('scan:error')

  ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })

    return canceled ? undefined : filePaths[0]
  })

  ipcMain.handle('config:get', async () => {
    return ConfigService.getConfig()
  })

  ipcMain.handle('config:set', async (_, config: Partial<Config>) => {
    return ConfigService.saveConfig(config)
  })

  ipcMain.handle('scan', async () => {
    const config = await ConfigService.getConfig()
    const root = config.vamInstallPaths?.[0]

    return addonPackageService.scan(root)
  })

  ipcMain.handle('scan:abort', async () => {
    return addonPackageService.abortScan()
  })

  ipcMain.handle('packages:get', async () => {
    return addonPackageService.getPackages()
  })
}

app
  .whenReady()
  .then(createWindow)
  .catch((err) => {
    console.error((err as Error)?.message)

    process.exit(0)
  })

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
