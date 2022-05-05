import Layout from '~/components/Layout/Layout'
import StyleProvider from '~/style/StyleProvider'

export default function App(): JSX.Element {
  return (
    <StyleProvider>
      <Layout />
    </StyleProvider>
  )
}
