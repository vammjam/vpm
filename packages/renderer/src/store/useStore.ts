import create, { GetState, SetState } from 'zustand'
import VarFile from '@shared/types/VarFile'

export type Packages = {
  [packageId: string]: VarFile
}

export type State = {
  packagesDir?: string
  packages?: Packages

  // Actions
  setPackagesDir: (dir: string) => void
  setPackages: (packages: VarFile[]) => void
}

const useStore = create<State>(
  (set: SetState<State>, get: GetState<State>) => ({
    setPackagesDir: (dir: string) => {
      set({
        packagesDir: dir,
      })
    },
    setPackages: (packages: VarFile[]) => {
      const updatedPackages = get().packages || {}

      for (const pkg of packages) {
        updatedPackages[pkg.id] = pkg
      }

      set({
        packages: updatedPackages,
      })
    },
  })
)

export default useStore
