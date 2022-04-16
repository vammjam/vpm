import { ChildProcess, spawn } from 'node:child_process'
import { AddressInfo } from 'node:net'

import electron from 'electron'
import { build, createServer } from 'vite'

const server = await createServer({
  configFile: 'packages/renderer/vite.config.ts',
})

await server.listen()

let electronProcess: ChildProcess | null = null
const address = server.httpServer?.address() as AddressInfo
const env = Object.assign(process.env, {
  VITE_DEV_SERVER_HOST: address.address,
  VITE_DEV_SERVER_PORT: address.port,
})

const startElectron = {
  name: 'electron-main-watcher',
  writeBundle() {
    electronProcess && electronProcess.kill()
    electronProcess = spawn(electron as unknown as string, ['.'], {
      stdio: 'inherit',
      env,
    })
  },
}

await build({
  configFile: 'packages/main/vite.config.ts',
  mode: 'development',
  plugins: [startElectron],
  build: {
    watch: {},
  },
})

await build({
  configFile: 'packages/preload/vite.config.ts',
  mode: 'development',
  build: {
    watch: {},
  },
})
