import { ReactNode } from 'react'
import CustomScroll from 'react-custom-scroll'
import styled from 'styled-components'

const View = styled.div`
  display: flex;
  overflow: hidden;
`

export default View

export const StackedView = styled(View)`
  flex-direction: column;
`

const ScrollViewContainer = styled(View)`
  overflow-y: auto;
  overflow-x: hidden;
`

export const ScrollView = ({
  children,
}: {
  children: ReactNode
}): JSX.Element => {
  return (
    <ScrollViewContainer>
      <CustomScroll>{children}</CustomScroll>
    </ScrollViewContainer>
  )
}
