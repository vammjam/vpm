import react from '@vitejs/plugin-react'
import { UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: UserConfig = {
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  // envDir: '../',
  // envPrefix: 'PUBLIC',
  build: {
    outDir: '../../dist',
    target: 'es2022',
  },
}

export default config
