import { builtinModules } from 'node:module'
import path from 'node:path'

import { UserConfig } from 'vite'

import pkg from '../../package.json'

const root = (...args: string[]) => path.join(__dirname, ...args)

// Allow importing node modules with the prefix "node:"
const nodePrefixedModules = builtinModules.map((name) => `node:${name}`)

const config: UserConfig = {
  root: root('src'),
  // envDir: '../',
  // envPrefix: 'PUBLIC',
  build: {
    outDir: '../../../dist',
    minify: process.env.NODE_ENV === 'production',
    sourcemap: true,
    rollupOptions: {
      external: [
        ...nodePrefixedModules,
        ...builtinModules,
        ...Object.keys(pkg.dependencies || {}),
      ],
    },
    lib: {
      entry: 'index.ts',
      formats: ['cjs'],
      fileName: () => 'preload.cjs',
    },
  },
  resolve: {
    alias: {
      '~/*': root('src'),
    },
  },
}

export default config
