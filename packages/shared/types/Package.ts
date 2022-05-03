import {
  AddonPackage as AddonPackageSchema,
  Creator,
  Image,
  Package,
  Scene as SceneSchema,
} from '@prisma/client'
import { PackageType } from '../enums'

export type AddonPackage = AddonPackageSchema & {
  images: Image[]
  package: Package
  creator: Creator
}

export type Scene = SceneSchema & {
  package: Package
  image: Image
}

export const ExtensionMap: Record<number, readonly string[]> = {
  [PackageType.ADDON_PACKAGE.value]: ['.var'],
  [PackageType.LEGACY_SCENE.value]: ['.vac'],
  [PackageType.MORPH.value]: ['.vmb', '.vmi', '.dsf'],
  [PackageType.HAIR.value]: ['.vab', '.vaj', '.vam'],
  [PackageType.CLOTHING.value]: ['.vab', '.vaj', '.vam'],
  [PackageType.PRESET.value]: ['.vap'],
  [PackageType.FAVORITE.value]: ['.fav'],
  [PackageType.SCRIPT.value]: ['.cs'],
  [PackageType.MANIFEST.value]: ['.json'],
  [PackageType.SCENE.value]: ['.json'],
  [PackageType.ASSET_BUNDLE.value]: ['.assetbundle'],
} as const

// export const getFileExtensionsFromType = (type: PackageType) => {
//   return ExtensionMap[type.value]
// }

export const getPackageTypeFromExtension = (
  ext: string
): PackageType | undefined => {
  const result = Object.entries(ExtensionMap).find(([, exts]) =>
    exts.includes(ext)
  )

  return PackageType.fromValue(result?.[0])
}

export const FileLocationMap: Record<number, readonly string[]> = {
  [PackageType.ADDON_PACKAGE.value]: ['/AddonPackages'],
  [PackageType.SCENE.value]: ['/Saves/scene', '/Custom/SubScene'],
} as const

// export const getFileLocationsFromType = (type: PackageType) => {
//   return FileLocationMap[type.value]
// }
