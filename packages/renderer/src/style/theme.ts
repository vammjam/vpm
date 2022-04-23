import { DefaultTheme } from 'styled-components'

const colors = {
  success: '#06d6a0',
  danger: '#ff3b30',
  faded: '#7e7e7e',
}

const fonts = {
  regular: `'DM Sans', sans-serif`,
  mono: `'DM Mono', monospace`,
}

const lightTheme: DefaultTheme = {
  name: 'light',
  fonts,
  colors: {
    ...colors,
    foreground: '#121212',
    background: '#eeeeee',
  },
}

const darkTheme: DefaultTheme = {
  name: 'dark',
  fonts,
  colors: {
    ...colors,
    foreground: '#eeeeee',
    background: '#121212',
  },
}

export { lightTheme, darkTheme }
