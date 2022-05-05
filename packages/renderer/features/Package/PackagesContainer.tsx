import { HTMLAttributes, useContext, useEffect } from 'react'
import styled from 'styled-components'
import { AddonPackage } from '@shared/types'
import { SelectedPackagesContext } from '~/components/Layout/Layout'
import useStore, { State } from '~/store/useStore'
import autoHideScrollbar from '~/utils/autoHideScrollbar'
import Package from './Package'

export default function PackagesContainer(
  props: HTMLAttributes<HTMLDivElement>
): JSX.Element {
  const [selectedPackages, setSelectedPackages] = useContext(
    SelectedPackagesContext
  )
  const { packages, getPackages } = useStore(packagesSelector)

  useEffect(() => {
    if (Object.keys(packages).length === 0) {
      getPackages()
    }
  }, [getPackages, packages])

  const handleChange = (pkg: AddonPackage) => (selected: boolean) => {
    if (selected === true) {
      setSelectedPackages({ ...selectedPackages, [pkg.id]: pkg })
    } else if (selected === false) {
      const pkgs = { ...selectedPackages }

      delete pkgs[pkg.id]

      setSelectedPackages(pkgs)
    }
  }

  return (
    <Container {...props}>
      {Object.values(packages).map((pkg) => {
        const selected = Object.keys(selectedPackages ?? {}).includes(pkg.id)

        return (
          <Package
            key={pkg.id}
            data={pkg}
            versions={pkg?.versions?.length ?? 0}
            onChange={handleChange(pkg)}
            selected={selected}
          />
        )
      })}
    </Container>
  )
}

const packagesSelector = ({ packages, getPackages }: State) => ({
  packages,
  getPackages,
})

const Container = styled.div`
  box-sizing: content-box;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  ${autoHideScrollbar('y')}
  padding: 0 0.5rem;
`
