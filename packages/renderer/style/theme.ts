import Color from 'color'
import { DefaultTheme } from 'styled-components'

type ColorRoleWithAlts = 'surface' | 'primary'
export type ColorRole =
  | ColorRoleWithAlts
  | 'accent'
  | 'success'
  | 'warning'
  | 'critical'
  | 'black'
  | 'white'

const weights = [
  50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800,
  850, 900,
] as const

export type ColorWeight = typeof weights[number]
export type Colors = {
  [key in ColorRole | `${ColorRoleWithAlts}${ColorWeight}`]: string
}

const weightsLen = weights.length
const primaryWhite = Color('#e1e1e1')
const primaryBlack = Color('#1c1c1c')

const colors: Pick<
  Colors,
  'success' | 'warning' | 'critical' | 'white' | 'black'
> = {
  success: '#06d6a0',
  warning: '#ffb94f',
  critical: '#ff3b30',
  black: primaryBlack.hex(),
  white: primaryWhite.hex(),
}

const parseColorAlternates = (
  colorName: ColorRoleWithAlts,
  alts: Record<ColorWeight | 0, string>
) => {
  const initial = {
    [colorName]: alts['0'],
  } as Record<ColorRoleWithAlts | `${ColorRoleWithAlts}${ColorWeight}`, string>

  return Object.entries(alts)
    .slice(1)
    .reduce((result, [altKey, altValue]) => {
      const resultKey =
        `${colorName}${altKey}` as `${ColorRoleWithAlts}${ColorWeight}`

      result[resultKey] = altValue

      return result
    }, initial)
}

const createColorAlternates = (color: Color, mix: Color) => {
  const result = {
    [0]: color.hex(),
  } as Record<ColorWeight | 0, string>

  for (let i = 0; i < weightsLen; i += 1) {
    const weight = weights[i]

    result[weight] = color.mix(mix, weight / 1000).hex()
  }

  return result
}

const createColors = (theme: 'dark' | 'light') => {
  const isDark = theme === 'dark'
  const mix = isDark ? Color('black') : Color('white')

  return {
    ...parseColorAlternates(
      'surface',
      createColorAlternates(isDark ? primaryBlack : primaryWhite, mix)
    ),
    ...parseColorAlternates(
      'primary',
      createColorAlternates(isDark ? primaryWhite : primaryBlack, mix)
    ),
  }
}

export const darkTheme: DefaultTheme = {
  name: 'dark',
  colors: {
    ...colors,
    accent: '#65d4e7',
    ...createColors('dark'),
  },
}

export const lightTheme: DefaultTheme = {
  name: 'light',
  colors: {
    ...colors,
    accent: '#1bbd69',
    ...createColors('light'),
  },
}

export const getSystemTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

  if (prefersDark.matches) {
    return 'dark'
  }

  return 'light'
}

// Logs each color role's name and hex value, in the color
// it represents. Useful while in development.

// const logThemeColors = (theme: DefaultTheme) => {
//   const arr = Object.entries(theme.colors).map(([key, value]) => ({
//     name: key,
//     value,
//   }))

//   for (const { name, value } of arr) {
//     console.log(`${theme.name}: %c${name}:${value}`, `color:${value}`)
//   }
// }

// logThemeColors(darkTheme)
// logThemeColors(lightTheme)
