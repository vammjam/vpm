import { Fragment, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import {
  StyleSheetManager,
  ThemeProvider,
  createGlobalStyle,
} from 'styled-components'
import reset from 'styled-reset'
import useStore, { State } from '~/store/useStore'
import { darkTheme, lightTheme } from './theme'

const GlobalStyle = createGlobalStyle`
  ${reset}

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    font-family: 'DM Sans', sans-serif;
    font-size: 18px;
    font-weight: 400;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
`

const selector = ({ theme }: State) => ({ theme })

export default function StyleProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const { theme } = useStore(selector)
  const providerTheme =
    theme === 'dark' ? darkTheme : theme === 'light' ? lightTheme : darkTheme

  return (
    <HelmetProvider>
      <ThemeProvider theme={providerTheme}>
        <Helmet>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=DM+Mono&family=DM+Sans&display=swap"
          />
        </Helmet>
        <StyleSheetManager disableVendorPrefixes>
          <Fragment>
            <GlobalStyle />
            {children}
          </Fragment>
        </StyleSheetManager>
      </ThemeProvider>
    </HelmetProvider>
  )
}
