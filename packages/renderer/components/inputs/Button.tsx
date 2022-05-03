import { ButtonHTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import shared from './shared'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export default function Button(props: ButtonProps): JSX.Element {
  return <StyledButton {...props} />
}

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  ${shared}

  ${({ active }) =>
    active &&
    css`
      color: ${({ theme }) => theme.colors.black};
      background-color: ${({ theme }) => theme.colors.accent};
    `};
`

export const ButtonGroup = styled.div`
  display: flex;

  button:not(:last-child),
  input:not(:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    margin-right: 0;
    border-right-color: ${({ theme }) => theme.colors.surface};
  }

  button:not(:first-child),
  input:not(:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`
