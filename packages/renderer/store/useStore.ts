import create, { GetState, SetState } from 'zustand'
import { AddonPackage, Config, Theme } from '@shared/types'
import { Layout } from '@shared/types'
import { getSystemTheme } from '~/style/theme'

export type Packages = {
  [name: string]: AddonPackage & {
    versions?: AddonPackage[]
  }
}

export type State = Required<Config> & {
  packages: Packages
  isScanning: boolean
  scanProgress?: number
  layout: Layout

  // Actions
  scan: () => void
  abortScan: () => void

  getPackages: () => void

  setTheme: (theme: Theme) => void
  setVamInstallPaths: (...paths: string[]) => void
  setLayout: (layout: Layout) => void
}

const config = (await window.api?.getConfig()) ?? {}
const theme = config?.theme ?? getSystemTheme()

const toMap = (packages: AddonPackage[]): Packages => {
  return packages.reduce((acc, curr) => {
    const match = Object.values(acc).find(
      (p) => p.package.name === curr.package.name
    )

    if (match) {
      if (!match.versions) {
        match.versions = []
      }

      match.versions = [...match.versions, curr]
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

  const setPackages = (packages: AddonPackage[]) => {
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

  window.api?.on('scan:stop', async (_: unknown) => {
    setIsScanning(false)

    const packages = await window.api?.getPackages()

    if (packages != null) {
      setPackages(packages)
    }
  })

  window.api?.on('scan:progress', (_: unknown, pct: number) => {
    setScanProgress(pct)
  })

  return {
    packages: {},
    isScanning: false,
    layout: config.layout ?? 'grid',
    vamInstallPaths: config.vamInstallPaths ?? [],
    theme,
    setLayout: async (layout: Layout) => {
      const newConfig = await window.api?.setConfig({
        layout,
      })

      if (newConfig && newConfig.layout) {
        set({
          layout: newConfig.layout,
        })
      }
    },
    getPackages: async () => {
      const packages = await window.api?.getPackages()

      if (packages != null) {
        setPackages(packages)
      }
    },
    setTheme: async (theme: Theme) => {
      const newConfig = await window.api?.setConfig({
        theme: theme,
      })

      set({
        theme: newConfig?.theme ?? 'auto',
      })
    },
    setVamInstallPaths: async (...paths: string[]) => {
      const newConfig = await window.api?.setConfig({
        vamInstallPaths: paths,
      })

      set({
        vamInstallPaths: newConfig?.vamInstallPaths ?? [],
      })
    },
    scan: () => {
      window.api?.scan()
    },
    abortScan: () => {
      window.api?.abortScan()
    },
  }
})

export default useStore
