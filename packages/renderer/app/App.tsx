import Layout from '~/app/Layout'
import StyleProvider from '~/style/StyleProvider'

export default function App(): JSX.Element {
  return (
    <StyleProvider>
      <Layout />
    </StyleProvider>
  )
}
