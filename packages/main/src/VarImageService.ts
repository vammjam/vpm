import path from 'node:path'
import Zip from 'adm-zip'
import fs from 'fs-extra'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import { VarManifest } from '@shared/types'

type VarImage = {
  data: Buffer | null
  path: path.ParsedPath
}

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
export const getImages = (manifest: VarManifest, zip: Zip): string[] => {
  const contentList = manifest?.contentList?.filter(isImage) ?? []
  const imagePaths = zip
    .getEntries()
    .map((entry) => entry.entryName)
    .filter(isImage)

  console.log(
    `Found ${imagePaths.length} images in ${manifest.packageName} folders`
  )

  return [...contentList, ...imagePaths]
}

const isImage = (filePath: string) => {
  const parsed = path.parse(filePath)

  if (parsed.dir.includes('\\Texture\\')) {
    return false
  }

  const ext = parsed.ext.toLowerCase()

  if (ext === '.jpg' || ext === '.png') {
    return true
  }

  return false
}

const getImageData = async (imagePath: string, zip: Zip): Promise<VarImage> => {
  return new Promise((resolve, reject) => {
    zip.readFileAsync(imagePath, (data, err) => {
      if (err) {
        return reject(err)
      }

      const image: VarImage = {
        data,
        path: path.parse(imagePath),
      }

      resolve(image)
    })
  })
}

const optimizeImages = async (src: string, dest: string) => {
  try {
    const files = await imagemin([`${src}/**/*.{jpg,png}`], {
      destination: dest,
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8],
        }),
      ],
    })

    return files.map(({ destinationPath }) => destinationPath)
  } catch (err) {
    console.error((err as Error)?.message)
  }
}

const saveVarImages = async (images: VarImage[], dir: string) => {
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

    const doesImageExist = await fs.pathExists(imageSavePath)

    if (!doesImageExist) {
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
 * 2. Save a full-size copy to disk in a tmp folder
 * 3. Optimize the image
 * 3. Save the optimized image to disk
 * 4. Delete the tmp folder
 * 5. Return image paths
 */
export const saveImages = async (images: string[], zip: Zip, dir: string) => {
  const tmp = path.join(dir, 'tmp')
  const data = await Promise.all(
    images.map((image) => getImageData(image, zip))
  )

  console.log('Saving images...')
  await saveVarImages(data, tmp)

  console.log('Optimizing images...')
  const files = await optimizeImages(tmp, dir)
  await fs.remove(tmp)

  console.log('Done!')

  return files
}
