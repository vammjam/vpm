import EventEmitter from 'node:events'
import path from 'node:path'
import { ContentType, PrismaClient } from '@prisma/client'
import Zip from 'adm-zip'
import { nanoid } from 'nanoid'
import prettyMs from 'pretty-ms'
import {
  VarManifest,
  VarPackage,
  varPackageExtensionMap,
  varPackageExtensions,
} from '@shared/types'
import { VarPackageScanError } from '@shared/types'
import list, { ListedFile } from '~/utils/list'
import { getImagesFromZip, saveImages } from './VarImageService'

const wait = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))

export default class VarPackageService extends EventEmitter {
  client = new PrismaClient()
  isCancelled = false
  scanStart: Date | null = null
  scanStop: Date | null = null

  async getPackages() {
    return this.client.varPackage.findMany({
      include: {
        creator: true,
        contentTypes: true,
        images: true,
      },
    })
  }

  async savePackage(
    fileName: string,
    filePath: string
  ): Promise<Omit<VarPackage, 'images'> | void> {
    const { creatorName, id, name, version } = parseFileName(fileName)

    const zip = new Zip(filePath)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      return console.error(`Invalid package (no manifest found) for "${id}"`)
    }

    const creator = await this.#parseCreator(creatorName)
    const images = getImagesFromZip(zip, name)
    const imageText = images.length >= 2 ? 'images' : 'image'

    console.log(`Found ${images.length} ${imageText} for package "${id}"`)

    const savedImages = await saveImages(
      images,
      zip,
      path.join(process.cwd(), 'images', creator.name)
    )

    console.log('Saved images')

    const varPackage = await this.client.varPackage.create({
      include: {
        contentTypes: true,
        images: true,
        creator: true,
      },
      data: {
        id,
        name,
        path: filePath,
        version,
        createdAt: new Date(),
        description: manifest.description ?? null,
        creator: {
          connectOrCreate: {
            create: {
              ...creator,
            },
            where: {
              name: creator.name,
            },
          },
        },
        contentTypes: {
          create: getPackageContentTypes(zip),
        },
        images: {
          create: savedImages,
        },
      },
    })

    return varPackage
  }

  async cancelScan() {
    this.isCancelled = true
  }

  async scan(dir: string) {
    this.isCancelled = false
    this.emit('scan:start')
    this.scanStart = new Date()

    console.log('Scan started')

    const files = await list(dir, '.var')

    if (files.length > 0) {
      console.log(`Found ${files.length} packages.`)

      const currentPackages = await this.client.varPackage.findMany({
        select: {
          path: true,
        },
      })

      const unscannedPackages = files.filter(({ path }) => {
        return !currentPackages.find((p) => p.path === path)
      })

      console.log(`${unscannedPackages.length} of which are new.`)

      await wait(2)

      const groupedByCreator = groupPackagesByCreator(unscannedPackages)

      const vars = []
      const errors: VarPackageScanError[] = []
      let i = 0
      let lastPercent = 0
      const len = unscannedPackages.length
      const packages = Object.entries(groupedByCreator)

      for await (const [creatorName, packageFiles] of packages) {
        if (this.isCancelled) {
          break
        }

        const pkgText = packageFiles.length >= 2 ? 'packages' : 'package'

        console.log(
          `Scanning ${packageFiles.length} ${pkgText} from "${creatorName}"`
        )

        for await (const file of packageFiles) {
          i += 1
          const pct = Math.round((100 * i) / len)
          try {
            const pkg = await this.savePackage(file.name, file.path)

            vars.push(pkg)
          } catch (err) {
            console.error((err as Error)?.message)

            errors.push({
              file: file.name,
              path: file.path,
              error: err,
            })
          }

          if (lastPercent !== pct) {
            this.emit('scan:progress', pct)

            lastPercent = pct
          }
        }

        console.log(`Done\n`)

        await wait(0.5)
      }

      await this.client.$disconnect()

      this.scanStop = new Date()
      const duration = this.scanStop.getTime() - this.scanStart.getTime()

      const filtered = vars.filter((file) => file != null) as VarPackage[]
      const completePrefix = `Scan ${
        this.isCancelled ? 'cancelled' : 'complete'
      }`
      console[this.isCancelled ? 'warn' : 'log'](
        `${completePrefix}: Saved ${filtered.length} new packages in ${prettyMs(
          duration
        )}.`
      )

      this.emit('scan:stop')
    }
  }

  async #parseCreator(creatorName: string) {
    const creator = await this.client.creator.findFirst({
      where: { name: creatorName },
    })

    return creator == null
      ? this.client.creator.create({
          data: {
            id: nanoid(),
            name: creatorName,
          },
        })
      : creator
  }
}

const getManifest = async (zip: Zip): Promise<VarManifest | undefined> => {
  return new Promise((resolve, reject) => {
    zip.getEntry('meta.json')?.getDataAsync((data, err) => {
      if (err) {
        return reject(err)
      }

      const manifest = data?.toString('utf8')

      if (manifest == null || manifest?.trim() === '') {
        return reject('meta.json not found')
      }

      try {
        const parsed = JSON.parse(manifest) as VarManifest

        resolve(parsed)
      } catch (err) {
        reject(err)
      }
    })
  })
}

const isValidString = (str?: string) => {
  return (
    str != null &&
    typeof str === 'string' &&
    str !== '' &&
    (str?.length ?? 0) > 0
  )
}

const parseFileName = (fileName: string) => {
  const [creatorName, name, version] = fileName
    .split('.')
    .map((str) => str.trim())

  if (!isValidString(creatorName)) {
    throw new Error(
      `Invalid creator name "${creatorName}" for package "${fileName}"`
    )
  }

  if (!isValidString(name)) {
    throw new Error(`Invalid package name "${name}" ${fileName}`)
  }

  return {
    creatorName,
    name,
    version: Number(version),
    id: `${creatorName}.${name}.${version}`,
  }
}

const getPackageContentTypes = (
  zip: Zip
): Pick<ContentType, 'contentTypeId'>[] => {
  const allExts = zip
    .getEntries()
    .map((entry) => path.parse(entry.entryName).ext)
  const exts = [...new Set(allExts)]

  return exts
    .filter((ext) => varPackageExtensions.includes(ext))
    .map((ext) => varPackageExtensionMap[ext] ?? null)
    .filter((type) => type != null)
    .map((type) => ({
      contentTypeId: type,
    }))
}

const groupPackagesByCreator = (packages: ListedFile[]) => {
  return packages.reduce((acc, curr) => {
    const { creatorName } = parseFileName(curr.name)

    if (!acc[creatorName]) {
      acc[creatorName] = []
    }

    acc[creatorName].push(curr)

    return acc
  }, {} as Record<string, ListedFile[]>)
}
