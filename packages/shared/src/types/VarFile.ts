export type VarFileType = 'scene' | 'look'

export default interface VarFile {
  id: string
  name: string
  path: string
  images?: string[]
  mainImage?: string
  isInstalled?: boolean
  description?: string
  creator?: string
}
