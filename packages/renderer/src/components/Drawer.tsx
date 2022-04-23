import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

export type DrawerProps = {
  open: boolean
  children: ReactNode
  anchor: 'left' | 'bottom' | 'right'
  width: string | number
  height: string | number
  onClose?: () => void
}

const Container = styled.div<DrawerProps>`
  position: fixed;
  ${({ anchor }) =>
    anchor === 'bottom' &&
    css`
      bottom: 0;
      left: 0;
      right: 0;
    `}
  width: ${({ width }) => width};
  transform: translate(0, 0);
  transition: transform 0.2s ease-in-out;

  .xterm-viewport {
    overflow: hidden;
  }
`

const CloseButton = styled.div`
  position: absolute;
  top: 1rem;
  right: 0;
  height: 1rem;
  background: white;
  z-index: 2;
`

export default function Drawer({
  children,
  ...props
}: DrawerProps): JSX.Element {
  // const position: [number | string, number | string] = [0, 0]

  // if (props.anchor === 'bottom') {
  //   if (props.open) {
  //     position[1] = `calc(100vh - ${props.height})`
  //   } else {
  //     position[1] = '100vh'
  //   }
  // }

  const handleClose = () => {
    if (props.onClose) {
      props.onClose()
    }
  }

  return (
    <Container
      {...props}
      style={
        {
          // transform: `translate(${position[0]}, ${position[1]})`,
        }
      }
    >
      {/* <CloseButton onClick={handleClose}>x</CloseButton> */}
      {children}
    </Container>
  )
}
