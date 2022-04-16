import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  getVarFiles: (dir: string) => ipcRenderer.invoke('getVarFiles', dir),
})
