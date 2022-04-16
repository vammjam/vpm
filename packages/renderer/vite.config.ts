import path from 'node:path'

import react from '@vitejs/plugin-react'
import { UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const root = (...args: string[]) => path.join(__dirname, ...args)

console.log(root('src'))

const config: UserConfig = {
  plugins: [
    react(),
    tsconfigPaths({
      root: '../',
    }),
  ],
  root: root('src'),
  // envDir: '../',
  // envPrefix: 'PUBLIC',
  build: {
    outDir: '../../../dist',
  },
}

export default config
