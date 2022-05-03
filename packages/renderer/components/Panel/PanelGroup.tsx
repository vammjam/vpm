import {
  Children,
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import styled from 'styled-components'
import clamp from '~/utils/clamp'
import Divider from './Divider'
import Panel from './Panel'
import { Direction, PanelConfig } from './types'

export type PanelGroupProps = {
  children: ReactNode
  direction: Direction
  config?: PanelConfig[]
  onUpdate: (data: PanelConfig[]) => void
}

const defaultPanelItemConfig: PanelConfig = {
  resize: 'stretch',
  size: 0,
}

const Container = styled.div<{ $direction: Direction }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: ${({ $direction }) => $direction};
`

type PanelConfigState = Record<number, PanelConfig>

export default function PanelGroup({
  children,
  direction,
  config,
  onUpdate,
}: PanelGroupProps): JSX.Element {
  const ref = useRef<HTMLDivElement | null>(null)
  const childrenArray = Children.toArray(children)
  const childrenArrayLen = childrenArray.length
  const [configs, setConfigs] = useState(() => convertConfigsToState(config))

  useEffect(() => {
    onUpdate(Object.values(configs))
  }, [onUpdate, configs])

  const handleDividerUpdate = useCallback(
    (i: number) =>
      (delta: number, down = false) => {
        const newConfigs = { ...configs }
        const configValues = Object.values(newConfigs)
        const len = configValues.length
        const nonFixedLen = configValues.filter(
          (c, j) => j !== i && c.resize !== 'fixed'
        ).length
        const otherConfigsDelta = delta / nonFixedLen
        const currentConfig = newConfigs[i]

        if (currentConfig.maxSize != null && currentConfig.minSize != null) {
          const { size, minSize, maxSize } = currentConfig
          const newSize = clamp(size + delta, minSize, maxSize)

          newConfigs[i].size =
            !down && newSize > maxSize - 100
              ? maxSize
              : !down && newSize < minSize + 100
              ? minSize
              : newSize
        } else {
          newConfigs[i].size += delta
        }

        for (let j = i + 1; j < len; j++) {
          if (newConfigs[j].resize !== 'fixed') {
            newConfigs[j].size -= otherConfigsDelta
          }
        }

        setConfigs(newConfigs)
      },
    [configs]
  )

  return (
    <Container $direction={direction} ref={ref}>
      {childrenArray.map((child, i) => {
        const { resize, size } = configs[i]

        return (
          <Fragment key={i}>
            <Panel size={size} direction={direction}>
              {child}
            </Panel>
            {i < childrenArrayLen - 1 && resize !== 'fixed' && (
              <Divider
                direction={direction}
                onUpdate={handleDividerUpdate(i)}
              />
            )}
          </Fragment>
        )
      })}
    </Container>
  )
}

const convertConfigsToState = (configs?: PanelConfig[]): PanelConfigState => {
  if (!configs || !Array.isArray(configs)) return {}

  const state = {} as PanelConfigState
  const len = configs.length

  for (let i = 0; i < len; i += 1) {
    state[i] = configs?.[i] ?? defaultPanelItemConfig
  }

  return state
}
