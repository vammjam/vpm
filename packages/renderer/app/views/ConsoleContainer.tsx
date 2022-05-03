import { useCallback, useState } from 'react'
import { Drawer, View } from '~/components'
import Console from './Console'

export default function ConsoleContainer(): JSX.Element {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const handleOpen = useCallback(() => {
    setIsDrawerOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsDrawerOpen(false)
  }, [])

  return (
    <View>
      <Drawer
        anchor="bottom"
        // height="33vh"
        width="100%"
        open={isDrawerOpen}
        onClose={handleClose}
        onOpen={handleOpen}
      >
        <Console />
      </Drawer>
    </View>
  )
}
