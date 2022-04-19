import { Config, VarPackage } from '@shared/types'

declare global {
  interface Window {
    api: {
      selectFolder: () => Promise<string | undefined>
      getConfig: () => Promise<Config>
      saveConfig: (config: Partial<Config>) => Promise<Config>
      scan: () => Promise<VarPackage[] | undefined>
    }
  }
}

export {}
