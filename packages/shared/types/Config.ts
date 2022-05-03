export type Theme = 'light' | 'dark' | 'auto'
export type Layout = 'grid' | 'list'

export const defaultConfig: Config = {
  theme: 'auto',
  layout: 'grid',
  imageSaveQuality: 70,
}

export default interface Config {
  vamInstallPaths?: string[]
  theme: Theme
  layout: Layout
  imageSaveQuality: number
}
