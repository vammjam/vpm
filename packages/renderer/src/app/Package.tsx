import styled from 'styled-components'
import { VarPackage } from '@shared/types'

export type PackageProps = {
  pkg: VarPackage
  versions: number
}

const Container = styled.div`
  margin: 1rem;
`

export default function Package({ pkg, versions }: PackageProps): JSX.Element {
  return (
    <Container>
      <h1>
        {pkg.id} {versions > 0 ? `(${versions + 1})` : ''}
      </h1>
      <p>{pkg.description}</p>
    </Container>
  )
}
