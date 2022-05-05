import { RiLayoutGridLine, RiLayoutRowLine } from 'react-icons/ri'
import { Button, ButtonGroup } from '~/components/inputs'
import useStore, { State } from '~/store/useStore'

const selector = ({ layout, setLayout }: State) => ({ layout, setLayout })

export default function ViewToggle(): JSX.Element {
  const { layout, setLayout } = useStore(selector)

  const handleSetLayout = (newLayout: 'grid' | 'list') => () =>
    setLayout(newLayout)

  return (
    <ButtonGroup>
      <Button active={layout === 'grid'} onClick={handleSetLayout('grid')}>
        <RiLayoutGridLine />
      </Button>
      <Button active={layout === 'list'} onClick={handleSetLayout('list')}>
        <RiLayoutRowLine />
      </Button>
    </ButtonGroup>
  )
}
