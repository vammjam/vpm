import { ipcRenderer } from 'electron'
import { Config } from '@shared/types'
import { Api } from '@shared/types'

export default {
  selectFolder: async () => {
    return ipcRenderer.invoke('dialog:openDirectory')
  },
  getConfig: async () => {
    return ipcRenderer.invoke('getConfig')
  },
  setConfig: async (config: Partial<Config>) => {
    return ipcRenderer.invoke('saveConfig', config)
  },
  scan: async () => {
    return ipcRenderer.invoke('scan')
  },
  cancelScan: async () => {
    return ipcRenderer.invoke('cancelScan')
  },
  getPackages: async () => {
    return ipcRenderer.invoke('getPackages')
  },
  on: (event: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.on(event, callback)
  },
} as Api
