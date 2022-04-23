import { Api } from '@shared/types'

declare global {
  interface Window {
    api?: Api
    //   api: {
    //     selectFolder: () => Promise<string | undefined>
    //     getConfig: () => Promise<Config>
    //     saveConfig: (config: Partial<Config>) => Promise<Config>
    //     scan: () => Promise<VarPackage[] | undefined>
    //     getPackages: () => Promise<VarPackage[]>
    //     on: (
    //       event: IpcMainEvent,
    //       listener: (...args: never[]) => void
    //     ) => Promise<void>
    //   }
  }
}

export {}
