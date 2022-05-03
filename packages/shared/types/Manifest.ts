type StringifiedBool = 'true' | 'false'

/**
 * This interface describes the structure of a VaM
 * manifest file, named "manifest.json", and can be found at
 * the root of a ".var" file.
 */
export default interface Manifest {
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
  contentList?: string[] // An array of file or folder paths to the content contained in this var file.
  dependencies?: ManifestDependency
  hadReferenceIssues?: StringifiedBool
  referenceIssues?: string[]
  customOptions?: {
    preloadMorphs?: StringifiedBool
  }
}

type ManifestDependency = {
  [id: string]: {
    licenseType?: string
    dependencies?: ManifestDependency
  }
}
