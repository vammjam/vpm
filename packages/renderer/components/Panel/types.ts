export type Direction = 'column' | 'row'
export type Resize = 'stretch' | 'fixed'
export type Position = 'top' | 'right' | 'bottom' | 'left'

export type PanelConfig = {
  resize?: Resize
  size: number
  maxSize?: number
  minSize?: number
  snap?: SnapConfig
}

type SnapConfig = Record<Position, number>
