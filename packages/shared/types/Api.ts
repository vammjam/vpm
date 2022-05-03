import Config from './Config'
import { AddonPackage } from './Package'

export const IpcEvent = {
  log: {
    info: 'log:info',
    warn: 'log:warn',
    err: 'log:err',
  },
  config: {
    get: 'config:get',
    set: 'config:set',
  },
  dialog: {
    openDirectory: 'dialog:openDirectory',
  },
  scan: {
    start: 'scan:start',
    stop: 'scan:stop',
    progress: 'scan:progress',
    import: 'scan:import',
    error: 'scan:error',
    abort: 'scan:abort',
  },
  packages: {
    get: 'packages:get',
    delete: 'packages:delete',
  },
}

export type ApiEvent =
  | `log:${keyof typeof IpcEvent.log}`
  | `config:${keyof typeof IpcEvent.config}`
  | `scan:${keyof typeof IpcEvent.scan}`
  | `packages:${keyof typeof IpcEvent.packages}`

export default interface Api {
  selectFolder: () => Promise<string>
  getConfig: () => Promise<Config>
  setConfig: (config: Partial<Config>) => Promise<Config>
  scan: () => Promise<void>
  abortScan: () => void
  getPackages: () => Promise<AddonPackage[]>
  deletePackage: (id: string) => Promise<void>
  on: <T = never>(
    event: ApiEvent,
    callback: (event: unknown, ...args: T[]) => void
  ) => void
}
