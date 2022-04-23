import chalk, { ChalkInstance } from 'chalk'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ITerminalOptions } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { XTerm } from 'xterm-for-react'
import Xterm from 'xterm-for-react/dist/src/XTerm'
import { ApiEvent } from '@shared/types'
import useStore, { State } from '~/store/useStore'

const termStyle = {
  fontFamily: '"SF Mono", "DM Mono", monospace',
  fontSize: 12,
  background: '#161618',
}

const Container = styled.div`
  padding: 1rem 0 0 1rem;
  background: ${termStyle.background};
  overflow: hidden !important;
`

const termOptions: ITerminalOptions = {
  disableStdin: true,
  convertEol: true,
  fontSize: termStyle.fontSize,
  fontFamily: termStyle.fontFamily,
  cursorBlink: false,
  customGlyphs: true,
  rendererType: 'dom',
  theme: {
    background: termStyle.background,
  },
}

const timeStampFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
})

const prefixVPM = chalk.hex('#65d4e7')('vpm')
const prefixArrow = chalk.greenBright('›')
const consoleWhite = chalk.hex('#bbbbbb')

const prefix = () => {
  const timestamp = chalk.dim(timeStampFormatter.format(new Date()))

  return `${timestamp} ${prefixVPM} ${prefixArrow}`
}

const formatDoubleQuotes = (str: string) => {
  const dq = str.match(/(?:"[^"]*"|^[^"]*$)/)?.[0]

  if (dq != null) {
    return str.replace(dq, chalk.hex('#7be0ab')(dq))
  }

  return str
}

export default function Console(): JSX.Element {
  const ref = useRef<Xterm | null>(null)
  const addonFit = useMemo(() => new FitAddon(), [])

  const writeln = useCallback((data: string) => {
    ref.current?.terminal?.writeln(
      `${prefix()} ${consoleWhite(formatDoubleQuotes(data))}`
    )
  }, [])

  const initApiListener = useCallback(
    (channel: ApiEvent, ci?: ChalkInstance) => {
      window.api?.on(channel, (_: unknown, data: string) => {
        writeln(ci ? ci(data) : data)
      })
    },
    [writeln]
  )

  useEffect(() => {
    initApiListener('log')
    initApiListener('log:warn', chalk.yellow)
    initApiListener('log:err', chalk.red)
    initApiListener('scan:error', chalk.red)

    ref.current?.terminal?.clear()
    writeln('Console started')

    addonFit.fit()
  }, [addonFit, initApiListener, writeln])

  return (
    <Container>
      <ConsoleProgress />
      <XTerm ref={ref} options={termOptions} addons={[addonFit]} />
    </Container>
  )
}

const selector = ({ isScanning, scanProgress }: State) => ({
  isScanning,
  scanProgress,
})

const ProgressContainer = styled.progress`
  -webkit-appearance: none;
  appearance: none;
  width: calc(100% - 1rem);
  height: 5px;
  background-color: rgba(0, 0, 0, 0.2);

  &::-webkit-progress-bar {
    background-color: #7be0ab;
  }
`

const ConsoleProgress: React.FC = () => {
  const { scanProgress, isScanning } = useStore(selector)

  return isScanning ? (
    <ProgressContainer max="100" value={scanProgress} />
  ) : null
}
