import { animated, useSpring } from '@react-spring/web'
import { useDrag } from '@use-gesture/react'
import styled, { css } from 'styled-components'
import { Direction } from './types'

const Container = styled.div<{ $direction: Direction }>`
  touch-action: none;
  border-top: 2px solid ${({ theme }) => theme.colors.primary200};
  background-color: ${({ theme }) => theme.colors.surface};
  transition-property: background-color;
  transition-duration: 100ms;
  transition-timing-function: ease-out;
  box-sizing: border-box;

  ${({ $direction }) =>
    $direction === 'column' &&
    css`
      height: 4px;
      width: 100%;
      cursor: row-resize;
    `}
  ${({ $direction }) =>
    $direction === 'row' &&
    css`
      height: 100%;
      width: 4px;
      cursor: col-resize;
    `}

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background-color: ${({ theme }) => theme.colors.accent};
  }
`

const AnimatedContainer = animated(Container)

export type DividerProps = {
  direction: Direction
  onUpdate: (data: number, down: boolean) => void
}

const dragConfig = {
  delay: true,
}

export default function Divider({
  direction,
  onUpdate,
}: DividerProps): JSX.Element {
  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))
  const bind = useDrag(({ down, delta: [dx, dy] }) => {
    api.start({ x: dx, y: dy, immediate: down })

    onUpdate(direction === 'column' ? dy : dx, down)
  }, dragConfig)

  return (
    <AnimatedContainer
      $direction={direction}
      {...bind()}
      style={direction === 'column' ? { y } : { x }}
    />
  )
}
