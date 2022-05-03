import { StrictMode } from 'react'
import { render } from 'react-dom'
import App from '~/app/App'

/**
 * React 18's render mode breaks x-term, so for now, we have
 * to use the old render, which throws a nice error in the
 * console that we can safely ignore.
 */
const root = document.getElementById('root')

render(
  <StrictMode>
    <App />
  </StrictMode>,
  root
)
