import useStore, { State } from '~/store/useStore'

const selector = ({ packagesDir, setPackagesDir }: State) => ({
  packagesDir,
  setPackagesDir,
})

export default function App(): JSX.Element {
  const { packagesDir, setPackagesDir } = useStore(selector)

  const handleSetPackagesDir = async () => {
    const dir = await window.api.selectFolder()

    if (typeof dir === 'string' && dir.length > 0) {
      setPackagesDir(dir)
    }
  }

  return packagesDir ? (
    <div>{packagesDir}</div>
  ) : (
    <button onClick={handleSetPackagesDir}>Set Packages Dir</button>
  )
}
