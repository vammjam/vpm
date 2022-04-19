import { contextBridge, ipcRenderer } from 'electron'
import { Config } from '@shared/types'

contextBridge.exposeInMainWorld('api', {
  selectFolder: async () => ipcRenderer.invoke('dialog:openDirectory'),
  getConfig: async () => ipcRenderer.invoke('getConfig'),
  saveConfig: async (config: Partial<Config>) =>
    ipcRenderer.invoke('saveConfig', config),
  scan: async () => ipcRenderer.invoke('scan'),
})
