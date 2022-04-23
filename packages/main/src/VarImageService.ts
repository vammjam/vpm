import fsp from 'node:fs/promises'
import path, { ParsedPath } from 'node:path'
import { PrismaClient } from '@prisma/client'
import Zip from 'adm-zip'
import fs from 'fs-extra'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import { nanoid } from 'nanoid'
import stringSimilarity from 'string-similarity'
import { Image, varPackageExtensions } from '@shared/types'

type ImageData = {
  data: Buffer | null
  path: path.ParsedPath
}

const client = new PrismaClient()
const imageFileExtensions = ['.jpg', '.png']

/**
 * Find all possible images in this package by comparing
 * file names of the images to file names of other listed
 * (non-image) content. Typically, the images we will want
 * to save are named exactly, or very similarly, to other
 * content found within the zip.
 */
export const getImagesFromZip = (zip: Zip, fileName: string): string[] => {
  const entries = zip.getEntries().map((entry) => path.parse(entry.entryName))
  const imagePaths = entries.filter(isImage)

  const content = [fileName, ...entries.filter(isContent).map((p) => p.name)]
  const contentImages = imagePaths.filter((ip) => {
    return content.some(
      (c) => stringSimilarity.compareTwoStrings(c, ip.name) > 0.7
    )
  })

  return contentImages.map((p) => `${p.dir}/${p.base}`)
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

const optimizeImages = async (
  images: string[],
  dest: string
): Promise<string[]> => {
  // imagemin expects Unix-style paths...
  const unixStylePaths = images.map((imagePath) =>
    imagePath.replaceAll(/\\/g, '/')
  )

  const files = await imagemin(unixStylePaths, {
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
  const savePaths = []

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
    const imageTmpSavePath = path.join(dir, 'tmp', image.path.base)
    const doesImageExistOnDisk = await fs.pathExists(imageSavePath)

    if (!doesImageExistOnDisk && image.data != null) {
      await fsp.writeFile(imageTmpSavePath, image.data)

      savePaths.push(imageTmpSavePath)
    }
  }

  return savePaths
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
  zip: Zip,
  dir: string
): Promise<Omit<Image, 'varPackageId'>[]> => {
  const tmp = path.join(dir, 'tmp')
  await fs.ensureDir(tmp)

  const data = await Promise.all(
    images.map((image) => getImageData(image, zip))
  )

  const imagePaths = await saveVarImages(data, dir)

  console.log('Optimizing images...')
  const files = await optimizeImages(imagePaths, dir)
  await fs.remove(tmp)

  return files.map((file) => {
    return {
      id: nanoid(),
      path: file,
      sort: 0,
    }
  })
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
