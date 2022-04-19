import useStore, { State } from '~/store/useStore'
import Package from './Package'

export default function App(): JSX.Element {
  const { getConfig, saveConfig, scan, config, packages } = useStore()

  const handleSetVamPath = async () => {
    const dir = await window.api.selectFolder()

    if (typeof dir === 'string' && dir.length > 0) {
      await saveConfig({ vamInstallPath: dir })
    }
  }

  return packages ? (
    <div>
      {Object.values(packages).map((varPackage) => {
        return <Package key={varPackage.id} pkg={varPackage} />
      })}
    </div>
  ) : (
    <button onClick={handleSetVamPath}>Set VaM Install Path</button>
  )
}
