import path from 'node:path'
import { ContentType, PrismaClient } from '@prisma/client'
import Zip from 'adm-zip'
import { nanoid } from 'nanoid'
import {
  VarManifest,
  VarPackage,
  varPackageExtensionMap,
  varPackageExtensions,
} from '@shared/types'
import list from '~/utils/list'
import { getImagesFromZip, saveImages } from './VarImageService'

const client = new PrismaClient()

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

      resolve(JSON.parse(manifest) as VarManifest)
    })
  })
}

const parseCreator = async (creatorName: string) => {
  const creator = await client.creator.findFirst({
    where: { name: creatorName },
  })

  return creator == null
    ? client.creator.create({
        data: {
          id: nanoid(),
          name: creatorName,
        },
      })
    : creator
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
    .filter(varPackageExtensions.includes)
    .map((ext) => varPackageExtensionMap[ext] ?? null)
    .filter((type) => type != null)
    .map((type) => ({
      contentTypeId: type,
    }))
}

const savePackage = async (
  fileName: string,
  filePath: string
): Promise<VarPackage | void> => {
  try {
    const { creatorName, id, name, version } = parseFileName(fileName)

    console.log(`\nReading package "${id}"`)

    const zip = new Zip(filePath)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      return console.error(`\nInvalid package (no manifest found) for "${id}"`)
    }

    const exists = await client.varPackage.findFirst({
      include: {
        contentTypes: true,
        images: true,
        creator: true,
      },
      where: {
        id,
      },
    })

    if (exists != null) {
      console.log(`Package "${id}" already exists in database.`)
    }

    const creator = await parseCreator(creatorName)
    const images = getImagesFromZip(zip)

    console.log(`Found ${images.length} images for package "${id}"`)

    const savedImages = await saveImages(
      images,
      id,
      zip,
      path.join(process.cwd(), 'images', creator.name)
    )

    const varPackage =
      exists ??
      (await client.varPackage.create({
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
      }))

    return varPackage
  } catch (err) {
    console.error((err as Error)?.message)
  }
}

export const scan = async (dir: string): Promise<VarPackage[] | undefined> => {
  const files = await list(dir, '.var')

  if (files.length > 0) {
    console.log(`Found ${files.length} packages.`)

    const vars = await Promise.all(
      files.map((file) => savePackage(file.name, file.path))
    )

    return vars.filter((file) => file != null) as VarPackage[]
  }

  console.warn(`No var packages found in ${dir}!`)
}
