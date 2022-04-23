import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string
    fonts: {
      regular: string
      mono: string
    }
    colors: {
      foreground: string
      background: string
      faded: string
      success: string
      danger: string
    }
  }
}
