import path from 'node:path'
import { dialog, ipcMain } from 'electron'
import { BrowserWindow, app } from 'electron'
import { read } from './VarFileService'

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

  ipcMain.handle('getVarFiles', async (event, dir: string) => {
    const files = await read(dir)

    return files
  })
}

app
  .whenReady()
  .then(init)
  .catch((err) => {
    console.error((err as Error)?.message)

    process.exit(0)
  })
