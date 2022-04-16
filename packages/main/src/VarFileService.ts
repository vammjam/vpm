import path from 'node:path'
import Zip from 'adm-zip'
import { VarFile, VarManifest } from '@shared/types'
import list, { ListedFile } from '~/utils/list'
import { getImages, saveImages } from './VarImageService'

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

const parseVarFile = async (file: ListedFile): Promise<VarFile | void> => {
  try {
    const zip = new Zip(file.path)
    const manifest = await getManifest(zip)

    if (manifest == null) {
      return console.error(
        `\nInvalid package (no manifest found): ${file.name}`
      )
    }

    console.log(`\nReading ${manifest.packageName}...`)

    if (manifest.packageName == null) {
      return console.error(`Package name cannot be empty.`)
    }

    if (manifest.creatorName == null) {
      return console.error(`Creator name cannot be empty.`)
    }

    const images = getImages(manifest, zip)

    console.log(`Found ${images.length} images in ${manifest.packageName}`)

    const savedImages = await saveImages(
      images,
      zip,
      path.join(process.cwd(), 'images', manifest.creatorName)
    )

    return {
      id: file.name,
      path: file.path,
      name: manifest.packageName,
      description: manifest.description,
      creator: manifest.creatorName,
      images: savedImages,
    }
  } catch (err) {
    console.error((err as Error)?.message)
  }
}

export const read = async (dir: string): Promise<VarFile[] | undefined> => {
  const files = await list(dir, '.var')

  if (files.length > 0) {
    console.log(`Found ${files.length} packages.`)

    const vars = await Promise.all(files.map(parseVarFile))

    return vars.filter((file) => file != null) as VarFile[]
  }

  console.warn(`No var packages found in ${dir}!`)
}
