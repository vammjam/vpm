import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import Zip from 'adm-zip'
import { nanoid } from 'nanoid'
import { PackageType } from '@shared/enums'
import {
  ExtensionMap,
  FileLocationMap,
  Manifest,
  VarPackageScanError,
} from '@shared/types'
import wait from '@shared/utils/wait'
import list, { ListedFile } from '~/utils/list'
import {
  deleteImages,
  getImagesFromManifest,
  getImagesFromZip,
  saveImages,
} from './ImageService'
import ScanService from './ScanService'

export default class AddonPackageService extends ScanService {
  async deletePackage(id: string) {
    try {
      const addonPackage = await this.client.addonPackage.delete({
        include: {
          images: true,
          package: true,
        },
        where: {
          id,
        },
      })

      await deleteImages(addonPackage.images.map((i) => i.path))
    } catch {
      console.error(`Failed to delete package "${id}"`)
    }
  }

  async scan(root?: string) {
    this.startScan()

    const dirs =
      root == null
        ? []
        : FileLocationMap[PackageType.ADDON_PACKAGE.value].map((dir) =>
            path.join(root, dir)
          )

    let importedLength = 0

    if (dirs.length === 0) {
      console.error(`Invalid VaM install path: "${root}"`)
    }

    for await (const dir of dirs) {
      console.log(`Scanning ${dir}`)

      const { new: unscannedPackages } = await getUnscannedPackages(
        dir,
        this.client
      )

      if (unscannedPackages.length > 0) {
        console.log(`Importing ${unscannedPackages.length} new packages.`)
      }

      await wait(1)

      const { imported } = await this.#importPackages(unscannedPackages)

      importedLength += imported.length
    }

    await this.stopScan(importedLength)
  }

  async getPackages(take = 20, skip = 0) {
    return this.client.addonPackage.findMany({
      orderBy: {
        package: {
          createdAt: 'desc',
        },
      },
      skip,
      take,
      include: {
        creator: true,
        images: true,
        package: true,
      },
    })
  }

  #getImages(zip: Zip, manifest: Manifest, name: string) {
    const images = getImagesFromManifest(manifest)

    if (!Array.isArray(images) || images.length === 0) {
      return getImagesFromZip(zip, name)
    }

    return images ?? []
  }

  async #importPackage(file: ListedFile & ParsedFileName) {
    const { creatorName, id, name, version } = file

    const zip = new Zip(file.path)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      return console.error(`Invalid package (no manifest found) for "${id}"`)
    }

    const packageType = getPackageType(manifest)
    const images = this.#getImages(zip, manifest, name)
    const imageText = images.length >= 2 ? 'images' : 'image'

    console.log(`Found ${images.length} ${imageText} for package "${id}"`)

    const savedImages = await saveImages(
      images,
      zip,
      path.join(process.cwd(), 'images', creatorName)
    )

    const addonPackage = await this.client.addonPackage.create({
      include: {
        package: true,
        creator: true,
        images: true,
      },
      data: {
        id,
        version,
        description: manifest.description,
        packageTypeId: packageType,
        credits: manifest.credits,
        hasReferenceIssues: manifest.hadReferenceIssues === 'true',
        licenseType: manifest.licenseType,
        instructions: manifest.instructions,
        package: {
          create: {
            size: file.stats.size,
            name,
            createdAt: new Date(),
            path: file.path,
            birthtime: file.stats.birthtime,
          },
        },
        images: {
          create: savedImages,
        },
        creator: {
          connectOrCreate: {
            create: {
              id: nanoid(),
              name: creatorName,
            },
            where: {
              name: creatorName,
            },
          },
        },
      },
    })

    return addonPackage
  }

  async #importPackages(packages: ListedFile[]) {
    const imported = []
    const errors: VarPackageScanError[] = []
    const len = packages.length
    const groupedByCreator = groupPackagesByCreator(packages)

    const emitScanProgress = this.createScanProgressEmitter(len)

    for await (const entry of Object.entries(groupedByCreator)) {
      if (this.shouldAbortScan) {
        break
      }

      const [creatorName, creatorPackages] = entry

      const pkgText = creatorPackages.length >= 2 ? 'packages' : 'package'

      console.log(
        `Importing ${creatorPackages.length} ${pkgText} from "${creatorName}"`
      )

      for await (const file of creatorPackages) {
        if (this.shouldAbortScan) {
          break
        }

        try {
          const importedPackage = await this.#importPackage({ ...file })

          imported.push(importedPackage)

          this.emit('scan:import', importedPackage)
        } catch (err) {
          const prefix = `Failed to import package: `

          if ((err as Error).message == null) {
            console.error(prefix, err)
          } else {
            console.error(prefix, (err as Error).message)
          }

          errors.push({
            file: file.name,
            path: file.path,
            error: err,
          })
        }

        emitScanProgress()

        console.log(`Done\n`)

        await wait(0.1)
      }
    }

    return { imported, errors }
  }
}

const getUnscannedPackages = async (dir: string, client: PrismaClient) => {
  const files = await list(dir, '.var')

  const ret = {
    existing: files,
    new: [] as ListedFile[],
  }

  if (files == null || !Array.isArray(files) || files?.length === 0) {
    console.log(`No packages found in "${dir}"!`)

    return ret
  }

  const currentPackages = await client.addonPackage.findMany({
    select: {
      package: {
        select: {
          path: true,
        },
      },
    },
  })

  ret.new = files.filter(({ path }) => {
    return !currentPackages.find((p) => p.package.path === path)
  })

  return ret
}

const getManifest = async (zip: Zip): Promise<Manifest | undefined> => {
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
        const parsed = JSON.parse(manifest) as Manifest

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

type ParsedFileName = {
  creatorName: string
  id: string
  name: string
  version: number
}

const parseFileName = (filePath: string): ParsedFileName => {
  const [creatorName, name, version] = path.basename(filePath).split('.')

  if (!isValidString(creatorName)) {
    throw new Error(
      `Invalid creator name "${creatorName}" for package "${filePath}"`
    )
  }

  if (!isValidString(name)) {
    throw new Error(`Invalid package name "${name}" ${filePath}`)
  }

  return {
    creatorName,
    name,
    version: Number(version),
    id: `${creatorName}.${name}.${version}`,
  }
}

const ContentListPackageMap = {
  [PackageType.SCENE.value]: 'Saves\\scene',
  [PackageType.CLOTHING.value]: 'Custom\\Clothing',
  [PackageType.POSE.value]: 'Custom\\Atom\\Person\\Pose',
  [PackageType.SCRIPT.value]: 'Custom\\Scripts',
  [PackageType.ASSET_BUNDLE.value]: (p: string) => {
    return (
      p.includes('Custom\\Assets') &&
      ExtensionMap[PackageType.ASSET_BUNDLE.value].includes(path.parse(p).ext)
    )
  },
}

const findContentListForEntry = (
  manifest: Manifest,
  contentListIndex = 0,
  maxDepth = 3
): number | undefined => {
  if (
    contentListIndex >= (manifest.contentList?.length ?? 0) ||
    contentListIndex >= maxDepth
  ) {
    return
  }

  const entry = manifest.contentList?.[contentListIndex]

  if (entry == null) {
    return
  }

  const normalizedPath = path.normalize(entry)

  const result = Object.entries(ContentListPackageMap).find(([_, test]) => {
    if (typeof test === 'function') {
      return test(normalizedPath)
    }

    return normalizedPath.includes(test)
  })?.[0]

  if (result != null) {
    return Number(result)
  }

  return findContentListForEntry(manifest, contentListIndex + 1)
}

const getPackageType = (manifest?: Manifest): number | undefined => {
  if (manifest != null) {
    return findContentListForEntry(manifest)
  }
}

type VarFile<T> = T & {
  name: string
  path: string
}

const groupPackagesByCreator = <T>(packages: VarFile<T>[]) => {
  return packages.reduce((acc, curr) => {
    const parsed = parseFileName(curr.name)

    if (!acc[parsed.creatorName]) {
      acc[parsed.creatorName] = []
    }

    acc[parsed.creatorName].push({
      ...curr,
      ...parsed,
    })

    return acc
  }, {} as Record<string, (VarFile<T> & ParsedFileName)[]>)
}
