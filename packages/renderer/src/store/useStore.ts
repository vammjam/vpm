import create, { GetState, SetState } from 'zustand'
import { Config, VarPackage } from '@shared/types'

export type Packages = {
  [packageId: string]: VarPackage & {
    versions?: number[]
  }
}

type Theme = 'light' | 'dark' | 'auto'

export type State = {
  config: Config
  packages: Packages
  theme: Theme
  isScanning: boolean
  scanProgress?: number

  // Actions
  scan: () => void
  cancelScan: () => void
  setConfig: (config: Partial<Config>) => Promise<void>

  getPackages: () => Promise<void>
  setTheme: (theme: Theme) => void
}

const config = (await window.api?.getConfig()) ?? {}

const toMap = (packages: VarPackage[]): Packages => {
  return packages.reduce((acc, curr) => {
    const match = Object.values(acc).find((p) => p.name === curr.name)

    if (match) {
      match.versions = [...(match.versions ?? []), curr.version]
    } else {
      acc[curr.id] = curr
    }

    return acc
  }, {} as Packages)
}

const useStore = create<State>((set: SetState<State>, get: GetState<State>) => {
  const setIsScanning = (isScanning: boolean) => {
    set({
      isScanning,
    })
  }

  const setPackages = (packages: VarPackage[]) => {
    const currentPackages = Object.values(get().packages)
    const newPackages = toMap([...currentPackages, ...packages])

    set({
      packages: newPackages,
    })
  }

  const setScanProgress = (progress: number) => {
    set({
      scanProgress: progress,
    })
  }

  window.api?.on('scan:start', () => {
    setIsScanning(true)
  })

  window.api?.on('scan:stop', (_: unknown, vars) => {
    setIsScanning(false)
    setPackages(vars)
  })

  window.api?.on('scan:progress', (_: unknown, pct: number) => {
    setScanProgress(pct)
  })

  return {
    config,
    packages: {},
    isScanning: false,
    theme: 'auto',
    getPackages: async () => {
      const packages = await window.api?.getPackages()

      if (packages != null) {
        setPackages(packages)
      }
    },
    setConfig: async (data: Partial<Config>) => {
      const config = await window.api?.setConfig(data)

      if (config != null) {
        set({ config })
      }
    },
    scan: () => {
      window.api?.scan()
    },
    cancelScan: () => {
      window.api?.cancelScan()
    },
    setTheme: (theme: Theme) => {
      set({ theme })
    },
  }
})

export default useStore
