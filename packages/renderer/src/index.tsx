import { StrictMode } from 'react'
import { render } from 'react-dom'
// import { createRoot } from 'react-dom/client'
import App from '~/app/App'
import StyleProvider from '~/style/StyleProvider'

// const root = createRoot(document.getElementById('root') as HTMLElement)

// root.render(
//   <StrictMode>
//     <StyleProvider>
//       <App />
//     </StyleProvider>
//   </StrictMode>
// )
const root = document.getElementById('root')

render(
  <StrictMode>
    <StyleProvider>
      <App />
    </StyleProvider>
  </StrictMode>,
  root
)
