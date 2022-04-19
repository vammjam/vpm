import path, { ParsedPath } from 'node:path'
import { PrismaClient } from '@prisma/client'
import Zip from 'adm-zip'
import fs from 'fs-extra'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import { nanoid } from 'nanoid'
import { Image, varPackageExtensions } from '@shared/types'

type ImageData = {
  data: Buffer | null
  path: path.ParsedPath
}

const client = new PrismaClient()
const imageFileExtensions = ['.jpg', '.png']

/**
 * Find all possible image paths in this package by
 * looking in two places:
 * 1. The "contentList" array of manifest.json
 * 2. Looking into the folders
 *
 * Images should be referenced in meta.json, but
 * many won't be, so we look through each file included in
 * the package.
 */
export const getImagesFromZip = (zip: Zip): string[] => {
  // const contentList =
  //   manifest?.contentList?.map(path.parse).filter(isImage) ?? []
  const entries = zip.getEntries().map((entry) => path.parse(entry.entryName))

  const imagePaths = entries.filter(isImage)
  const content = entries.filter(isContent)

  const contentImages = content.filter((parsedPath) => {
    return imagePaths.some((imagePath) => imagePath.name === parsedPath.name)
  })

  return contentImages.map(path.format)
}

const isImage = (parsedPath: ParsedPath) => {
  if (parsedPath.dir.includes('\\Texture\\')) {
    return false
  }

  return imageFileExtensions.includes(parsedPath.ext)
}

const isContent = (parsedPath: ParsedPath) => {
  return varPackageExtensions.includes(parsedPath.ext)
}

const getImageData = async (
  imagePath: string,
  zip: Zip
): Promise<ImageData> => {
  return new Promise((resolve, reject) => {
    zip.readFileAsync(imagePath, (data, err) => {
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

const optimizeImages = async (src: string, dest: string): Promise<string[]> => {
  const imagemin = await import('imagemin')
  const files = await imagemin.default([`${src}/**/*.{jpg,png}`], {
    destination: dest,
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  })

  return files.map(({ destinationPath }) => destinationPath)
}

const saveVarImages = async (images: ImageData[], dir: string) => {
  for await (const image of images) {
    /**
     * To save images with the same exact path used in the
     * manifest, use this routine.
     */
    // const imageSavePath = path.resolve(
    //   saveDir,
    //   imageData.path.dir,
    //   imageData.path.base
    // )
    const imageSavePath = path.resolve(dir, image.path.base)

    const doesImageExistOnDisk = await fs.pathExists(imageSavePath)

    if (!doesImageExistOnDisk) {
      console.log(
        `Saving image "${path.format(image.path)} to "${imageSavePath}"`
      )

      await fs.outputFile(imageSavePath, image.data)
    }
  }
}

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
  images: string[],
  varPackageId: string,
  zip: Zip,
  dir: string
): Promise<Image[]> => {
  const tmp = path.join(dir, 'tmp')
  const data = await Promise.all(
    images.map((image) => getImageData(image, zip))
  )

  await saveVarImages(data, tmp)

  console.log('Optimizing images...')
  const files = await optimizeImages(tmp, dir)
  await fs.remove(tmp)

  const saved = files.map(async (file) => {
    const exists = await findImageInDatabase(file)

    if (exists && exists.varPackageId !== varPackageId) {
      console.warn(
        `Image "${file}" exists in database, but has an incorrect varPackageId: saved "${exists}" vs "${varPackageId}"`
      )
    }

    return (
      exists ??
      (await client.image.create({
        data: {
          id: nanoid(),
          path: file,
          varPackageId,
        },
      }))
    )
  })

  return Promise.all(saved)
}

export const findImageInDatabase = async (imagePath: string) => {
  return client.image.findFirst({
    where: { path: imagePath },
  })
}

export const saveImageSortValue = async (
  imageId: string,
  sortValue: number
) => {
  await client.image.update({
    where: {
      id: imageId,
    },
    data: {
      sort: sortValue,
    },
  })
}
