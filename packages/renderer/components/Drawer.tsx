// import { lighten } from 'khroma'
import { ReactNode } from 'react'
import { VscClose, VscExpandAll } from 'react-icons/vsc'
import styled, { css } from 'styled-components'

export type DrawerProps = {
  open: boolean
  children: ReactNode
  anchor: 'left' | 'bottom' | 'right'
  width?: string | number
  height?: string | number
  onClose?: () => void
  onOpen?: () => void
}

export default function Drawer({
  children,
  onClose,
  onOpen,
  height,
  width,
  // style,
  ...props
}: DrawerProps): JSX.Element {
  const handleToggle = () => {
    if (props.open && onClose != null) {
      onClose()
    } else if (onOpen != null) {
      onOpen()
    }
  }

  return (
    <Container {...props} style={{ width, height }}>
      <Menu>
        <ToggleButton onClick={handleToggle}>
          {props.open ? <VscClose /> : <VscExpandAll />}
        </ToggleButton>
      </Menu>
      {children}
    </Container>
  )
}

const Container = styled.div<DrawerProps>`
  position: absolute;
  ${({ anchor }) =>
    anchor === 'bottom' &&
    css`
      bottom: 0;
      left: 0;
      right: 0;
    `}
  transition: transform 0.2s ease-in-out;
  ${({ open }) =>
    open
      ? css`
          transform: translate(0, 0);
        `
      : css`
          transform: translate(0, calc(100% - 3rem));
        `}

  .xterm-viewport {
    overflow: hidden;
  }
`

const Menu = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
  z-index: 2000;
`

const ToggleButton = styled.div`
  height: 24px;
  width: 24px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`
