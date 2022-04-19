import create, { SetState } from 'zustand'
import { Config, VarPackage } from '@shared/types'

export type Packages = {
  [packageId: string]: VarPackage
}

export type State = {
  config?: Config
  packages?: Packages

  // Actions
  getConfig: () => Promise<void>
  saveConfig: (config: Partial<Config>) => Promise<void>
  scan: () => Promise<void>
}

const useStore = create<State>((set: SetState<State>) => ({
  getConfig: async () => {
    const config = await window.api.getConfig()

    set({ config })
  },
  saveConfig: async (data: Partial<Config>) => {
    const config = await window.api.saveConfig(data)

    set({ config })
  },
  scan: async () => {
    const packages = await window.api.scan()

    if (packages != null) {
      const scanned = packages.reduce((acc, curr) => {
        acc[curr.id] = curr

        return acc
      }, {} as Packages)

      set((prev) => ({
        packages: {
          ...prev.packages,
          ...scanned,
        },
      }))
    }
  },
}))

export default useStore
