import { Api } from '@shared/types'

declare global {
  interface Window {
    api?: Api
  }
}

export {}
