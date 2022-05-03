import { PrismaClient } from '@prisma/client'
import EventEmitter from 'events'
import prettyMs from 'pretty-ms'

export default abstract class ScanService extends EventEmitter {
  client = new PrismaClient()
  shouldAbortScan = false
  #scanStartTime: Date | null = null
  #scanStopTime: Date | null = null

  async abortScan() {
    this.shouldAbortScan = true
  }

  createScanProgressEmitter(progressLength: number) {
    let i = 0
    let lastPercent = 0

    return () => {
      i += 1
      const pct = Math.round((100 * i) / progressLength)

      if (lastPercent !== pct) {
        this.emit('scan:progress', pct)

        lastPercent = pct
      }
    }
  }

  startScan() {
    this.shouldAbortScan = false
    this.emit('scan:start')

    this.#scanStartTime = new Date()

    console.log('Scan started')
  }

  async stopScan(savedPackageCount: number) {
    this.#scanStopTime = new Date()

    const wasAborted = this.shouldAbortScan
    const duration = getTime(this.#scanStopTime) - getTime(this.#scanStartTime)
    const prettyDur = prettyMs(duration)
    const prefix = `Scan ${this.shouldAbortScan ? 'cancelled' : 'complete'}`

    await this.client.$disconnect()

    this.emit('scan:stop')

    console[wasAborted ? 'warn' : 'log'](
      `${prefix}: Saved ${savedPackageCount} new packages in ${prettyDur}.`
    )
  }
}

const getTime = (d: Date | null) => (d ? d.getTime() : 0)
