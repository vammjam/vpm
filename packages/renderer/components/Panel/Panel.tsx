import { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { Direction } from './types'

export type PanelProps = {
  children?: ReactNode
  size: number
  direction: Direction
}

const Container = styled.div<{ $size: number; $direction: Direction }>`
  ${({ $direction, $size }) =>
    $direction === 'column'
      ? css`
          height: ${$size}px;
        `
      : css`
          width: ${$size}px;
        `}
`

export default function Panel({
  children,
  size,
  direction,
}: PanelProps): JSX.Element {
  return (
    <Container $size={size} $direction={direction}>
      {children}
    </Container>
  )
}
