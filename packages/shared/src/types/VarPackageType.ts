enum VarPackageType {
  AddonPackage,
  LegacyScene,
  Morphs,
  HairAndClothing,
  Preset,
  Favorite,
  Script,
}

export default VarPackageType

export const varPackageExtensionMap: Record<string, VarPackageType> = {
  ['.var']: VarPackageType.AddonPackage,
  ['.vac']: VarPackageType.LegacyScene,
  ['.vmb']: VarPackageType.Morphs,
  ['.vmi']: VarPackageType.Morphs,
  ['.dsf']: VarPackageType.Morphs,
  ['.vab']: VarPackageType.HairAndClothing,
  ['.vaj']: VarPackageType.HairAndClothing,
  ['.vam']: VarPackageType.HairAndClothing,
  ['.vap']: VarPackageType.Preset,
  ['.fav']: VarPackageType.Favorite,
  ['.cs']: VarPackageType.Script,
}

export const varPackageExtensions = Object.keys(varPackageExtensionMap)