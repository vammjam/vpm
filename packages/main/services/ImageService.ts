import fsp from 'node:fs/promises'
import path, { ParsedPath } from 'node:path'
import { PrismaClient } from '@prisma/client'
import slugify from '@sindresorhus/slugify'
import Zip from 'adm-zip'
import fs from 'fs-extra'
import { nanoid } from 'nanoid'
import sharp from 'sharp'
import stringSimilarity from 'string-similarity'
import { ExtensionMap, Image, Manifest } from '@shared/types'
import ConfigService from './ConfigService'

type ImageData = {
  data: Buffer | null
  path: path.ParsedPath
}

const client = new PrismaClient()
const imageFileExtensions = ['.jpg', '.png']
const pkgFileExtensions = Object.values(ExtensionMap).flat()

/**
 * Saving images involves a few steps:
 * 1. Extract the image data from the zip
 * 2. Save full-size copies of each image in a tmp folder
 * 3. Optimize images
 * 3. Save optimized images to disk
 * 4. Delete the tmp folder
 * 5. Save images to the database
 * 6. Return saved Images
 */
export const saveImages = async (
  images: { sort: number; path: string }[],
  zip: Zip,
  dir: string
): Promise<Omit<Image, 'addonPackageId'>[]> => {
  const results: (ImageData & {
    sort: number
  })[] = []

  for await (const image of images) {
    const data = await getImageData(image.path, zip)

    results.push({
      ...data,
      sort: image.sort,
    })
  }

  const files = await saveVarImages(results, dir)

  return files.map((file) => {
    return {
      id: nanoid(),
      path: file.path,
      sort: Math.round(file.sort),
    }
  })
}

export const deleteImages = async (images: string[]) => {
  for await (const image of images) {
    try {
      await fsp.rm(image, {
        recursive: true,
      })
    } catch {
      console.error(`Failed to delete image: ${image}`)
    }
  }
}

export const findImageInDatabase = async (imagePath: string) => {
  return client.image.findFirst({
    where: { path: imagePath },
  })
}

// const mapNodePath = (p: ParsedPath) => `${p.dir}/${p.base}`
const mapToImage = (p: string, s: number) => ({ path: p, sort: s })

/**
 * Find all possible images in this package by comparing
 * file names of the images to file names of other listed
 * (non-image) content. Typically, the images we will want
 * to save are named exactly, or very similarly, to other
 * content found within the zip.
 */
export const getImagesFromZip = (
  zip: Zip,
  fileName: string
): Pick<Image, 'path' | 'sort'>[] => {
  // const entries = zip.getEntries().map((entry) =>
  // path.parse(entry.entryName))
  const entries = zip.getEntries().map((entry) => entry.entryName)
  const imagePaths = entries.filter(isImage)

  const content = [fileName, ...entries.filter(isContent)]
  const contentImages = imagePaths
    .map((ip) => {
      const score =
        Math.max(
          ...content.map((c) => stringSimilarity.compareTwoStrings(c, ip))
        ) * 100

      return {
        score,
        path: ip,
      }
    })
    .filter(({ score }) => score > 80)

  // If we don't find any images that match any content,
  // just return all images.
  if (contentImages.length === 0) {
    return imagePaths.map((p) => mapToImage(p, 0))
  }

  return contentImages.map(({ score, path }) => mapToImage(path, score))
}

export const getImagesFromManifest = (
  manifest: Manifest
): Pick<Image, 'path' | 'sort'>[] => {
  const images = manifest.contentList?.filter(isImage)

  return (
    images?.map((image, i) => ({
      sort: 100 - i * images.length,
      path: image,
    })) ?? []
  )
}

const isImage = (imagePath: string) => {
  if (imagePath.includes('Texture')) {
    return false
  }

  return imageFileExtensions.includes(path.extname(imagePath))
}

const isContent = (contentPath: string) => {
  return pkgFileExtensions.includes(path.extname(contentPath))
}

const getImageData = async (
  imagePath: string,
  zip: Zip
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    const zipPath = imagePath.replaceAll('\\', '/')

    zip.readFileAsync(zipPath, (data, err) => {
      if (err) {
        return reject(err)
      }

      const image: ImageData = {
        data,
        path: path.parse(imagePath),
      }

      resolve(image)
    })
  })
}

const saveVarImages = async <T>(
  images: (T & ImageData)[],
  dir: string
): Promise<(T & { path: string })[]> => {
  const newImages: (T & { path: string })[] = []
  const { imageSaveQuality } = await ConfigService.getConfig()

  await fs.ensureDir(dir)

  for await (const image of images) {
    const { path: imagePath } = image
    const name = `${slugify(imagePath.name)}${imagePath.ext}`

    const imageSavePath = path.resolve(dir, name)

    const doesImageExistOnDisk = await fs.pathExists(imageSavePath)

    if (image.data != null) {
      const newImage = {
        ...image,
        path: imageSavePath,
      } as T & { path: string }

      if (!doesImageExistOnDisk) {
        try {
          await sharp(image.data)
            .resize(512)
            .jpeg({ quality: imageSaveQuality })
            .toFile(imageSavePath)
        } catch (err) {
          console.error(
            `Failed writing image to disk: ${(err as Error).message}`
          )
        }
      }

      newImages.push(newImage)
    }
  }

  return newImages
}
