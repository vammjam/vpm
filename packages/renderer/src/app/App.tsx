import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import Console from '~/app/Console'
import Package from '~/app/Package'
import { Drawer, ScrollView, StackedView, View } from '~/components'
import useStore from '~/store/useStore'

// const View = styled.div`
//   display: flex;
//   max-height: 100vh;
//   overflow-y: auto;
//   overflow-x: hidden;
// `

const Packages = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100vw;

  > * {
    flex: 1;
  }
`

// const LeftPane = styled(Panel)`
//   flex: 1;
// `

// const RightPane = styled(Panel)`
//   flex: 2;
//   flex-direction: column;
// `

// const Loader = styled.div`
//   position: fixed;
//   inset: 0;
//   /* width: 100%;
//   height: 100vh;
//   background-color: rgba(0, 0, 0, 0.5);
//   backdrop-filter: blur(10px); */
// `

export default function App(): JSX.Element {
  const {
    setConfig: saveConfig,
    isScanning,
    scan,
    config,
    packages,
    getPackages,
    cancelScan,
  } = useStore()

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  const handleSetVamPath = async () => {
    const dir = await window.api?.selectFolder()

    if (typeof dir === 'string' && dir.length > 0) {
      await saveConfig({ vamInstallPath: dir })
    }
  }

  const handleScan = () => {
    if (!isScanning) {
      scan()
    }
  }

  const handleCancelScan = () => {
    cancelScan()
  }

  useEffect(() => {
    if (Object.keys(packages).length === 0) {
      getPackages()
    }
  }, [getPackages, packages])

  return (
    <StackedView>
      <View>
        <Drawer
          anchor="bottom"
          height="33vh"
          width="100%"
          open={isDrawerOpen}
          onClose={handleClose}
        >
          <Console />
        </Drawer>
      </View>
      <View>
        <input
          type="text"
          readOnly={true}
          value={config.vamInstallPath ?? ''}
        />
        <button onClick={handleSetVamPath}>Set Vam Path</button>
        <button onClick={handleScan} disabled={isScanning}>
          Scan
        </button>
        <button onClick={handleCancelScan} disabled={!isScanning}>
          Cancel Scan
        </button>
      </View>
      <ScrollView>
        <Packages>
          {Object.values(packages).map((varPackage) => {
            return (
              <Package
                key={varPackage.id}
                pkg={varPackage}
                versions={varPackage?.versions?.length ?? 0}
              />
            )
          })}
        </Packages>
      </ScrollView>
    </StackedView>
  )
}