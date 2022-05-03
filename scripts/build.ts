import { build } from 'vite'

console.log('Starting preload build')
await build({ configFile: 'packages/preload/vite.config.ts' })
console.log('Starting main build')
await build({ configFile: 'packages/main/vite.config.ts' })
console.log('Finished main build')
await build({ configFile: 'packages/renderer/vite.config.ts' })
console.log('Finished renderer build')

process.exit(0)
