import { forwardRef } from 'react'
import styled from 'styled-components'
import { View } from '~/components'
import { Button, ButtonGroup, TextBox } from '~/components/inputs'
import useStore, { State } from '~/store/useStore'
import ViewToggle from './ViewToggle'

const menuSelector = ({
  isScanning,
  scan,
  abortScan,
  vamInstallPaths,
  setVamInstallPaths,
}: State) => ({
  isScanning,
  scan,
  abortScan,
  vamInstallPath: vamInstallPaths[0],
  setVamInstallPaths,
})

const Menu = forwardRef<HTMLDivElement>((_, ref) => {
  const { isScanning, vamInstallPath, setVamInstallPaths, scan, abortScan } =
    useStore(menuSelector)

  const handleSetVamPath = async () => {
    const dir = await window.api?.selectFolder()

    if (typeof dir === 'string' && dir.length > 0) {
      setVamInstallPaths(dir)
    }
  }

  const handleScan = () => {
    if (!isScanning) {
      scan()
    }
  }

  const handleCancelScan = () => {
    abortScan()
  }

  return (
    <Container ref={ref}>
      <Section>
        <ViewToggle />
      </Section>
      <Section>
        <ButtonGroup>
          <Button onClick={handleScan} disabled={isScanning || !vamInstallPath}>
            Scan
          </Button>
          <Button onClick={handleCancelScan} disabled={!isScanning}>
            Cancel Scan
          </Button>
        </ButtonGroup>
      </Section>
      <Section>
        <ButtonGroup>
          <TextBox readOnly={true} value={vamInstallPath ?? ''} />
          <Button onClick={handleSetVamPath}>Set VaM Path</Button>
        </ButtonGroup>
      </Section>
    </Container>
  )
})

Menu.displayName = 'Menu'

export default Menu

const Container = styled(View)`
  -ms-overflow-style: scrollbar;
  -webkit-app-region: drag;
  justify-content: space-between;
  margin-right: 140px;
  padding: 1rem;

  button,
  input {
    -webkit-app-region: no-drag;
  }
`

const Section = styled.div`
  display: flex;

  &:last-child {
    justify-content: flex-end;
  }

  // Apply margin-right to all sections BUT the very first
  // one, which uses a ButtonGroup
  &:not(:first-child) {
    /* button:first-child {
      margin-right: 10px;
    } */
  }
`
