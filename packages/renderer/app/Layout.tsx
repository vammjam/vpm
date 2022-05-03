import { createContext, useCallback, useMemo, useRef, useState } from 'react'
import { AddonPackage } from '@shared/types'
import Console from '~/app/views/Console'
import Menu from '~/app/views/Menu'
import Packages from '~/app/views/PackagesContainer'
import { PanelConfig, PanelGroup } from '~/components/Panel'
import useLocalStorage from '~/hooks/useLocalStorage'
import useWindowSize from '~/hooks/useWindowSize'

const MIN_SIZE = 138

type SelectedPackageContextType = [
  Record<string, AddonPackage>,
  (prev: Record<string, AddonPackage>) => void
]

export const SelectedPackagesContext =
  createContext<SelectedPackageContextType>({} as never)

export default function Layout(): JSX.Element {
  const { height } = useWindowSize()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuPanelHeight = useMemo(() => {
    return menuRef.current?.clientHeight ?? 0
  }, [])
  const stretchHeight = useMemo(
    () => height - menuPanelHeight,
    [height, menuPanelHeight]
  )

  const [panels, setPanels] = useLocalStorage<PanelConfig[]>(
    'vpm.layout',
    () => {
      const minmax = { maxSize: stretchHeight - MIN_SIZE, minSize: MIN_SIZE }

      return [
        { resize: 'fixed', size: menuPanelHeight },
        { resize: 'stretch', size: stretchHeight * 0.7, ...minmax },
        { resize: 'stretch', size: stretchHeight * 0.3, ...minmax },
      ]
    }
  )

  const [selectedPackages, setSelectedPackages] = useState({})

  const handleUpdate = useCallback(
    (configs: PanelConfig[]) => {
      setPanels(configs)
    },
    [setPanels]
  )

  return (
    <SelectedPackagesContext.Provider
      value={[selectedPackages, setSelectedPackages]}
    >
      <PanelGroup direction="column" config={panels} onUpdate={handleUpdate}>
        <Menu ref={menuRef} />
        <Packages style={{ height: `${panels[1].size.toString()}px` }} />
        <Console style={{ height: `${panels[2].size.toString()}px` }} />
      </PanelGroup>
    </SelectedPackagesContext.Provider>
  )
}
