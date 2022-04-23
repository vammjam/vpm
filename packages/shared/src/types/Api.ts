import Config from './Config'
import VarPackage from './VarPackage'

export type ApiEvent =
  | 'log'
  | 'log:warn'
  | 'log:err'
  | 'scan:start'
  | 'scan:stop'
  | 'scan:progress'
  | 'scan:error'

export default interface Api {
  selectFolder: () => Promise<string>
  getConfig: () => Promise<Config>
  setConfig: (config: Partial<Config>) => Promise<Config>
  scan: () => Promise<void>
  cancelScan: () => void
  getPackages: () => Promise<VarPackage[]>
  on: <T = never>(
    event: ApiEvent,
    callback: (event: unknown, ...args: T[]) => void
  ) => void
}
