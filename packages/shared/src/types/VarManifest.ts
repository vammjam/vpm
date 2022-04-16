type StringifiedBool = 'true' | 'false'

/**
 * This interface describes the structure of a VaM
 * manifest file, which are found at the root of a ".var"
 * zip file, with the name "manifest.json".
 */
export default interface VarManifest {
  licenseType?: string
  creatorName?: string
  packageName?: string
  standardReferenceVersionOption?: 'Latest' | string
  scriptReferenceVersionOption?: 'Exact' | string
  includeVersionsInReferences?: StringifiedBool
  description?: string
  credits?: string
  instructions?: string
  promotionalLink?: string
  programVersion?: string
  contentList?: string[] // An array of file paths to the content contained in this var file.
  dependencies?: VarManifestDependency
  hadReferenceIssues?: StringifiedBool
  referenceIssues?: string[]
  customOptions?: {
    preloadMorphs?: StringifiedBool
  }
}

export interface VarManifestDependency {
  [name: string]: {
    licenseType?: string
    dependencies?: VarManifestDependency
  }
}
