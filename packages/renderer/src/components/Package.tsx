import { VarPackage } from '@shared/types'

export type PackageProps = {
  pkg: VarPackage
}

export default function Package({ pkg }: PackageProps): JSX.Element {
  return (
    <div>
      <h1>{pkg.name}</h1>
      <p>{pkg.description}</p>
      <p>{pkg.version}</p>
    </div>
  )
}
