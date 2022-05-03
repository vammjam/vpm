import { Fragment, ReactNode } from 'react'
import { Direction } from './types'

export type PanelProps = {
  children: ReactNode
  size: number
  direction: Direction
}

const styleSize = (direction: Direction, size: number) => {
  return {
    [direction === 'column' ? 'height' : 'width']: size,
  }
}

export default function Panel({
  children,
  direction,
  size,
}: PanelProps): JSX.Element {
  return <Fragment>{children}</Fragment>
  // return <div style={styleSize(direction, size)}>{children}</div>
}
