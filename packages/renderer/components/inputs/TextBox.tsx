import { InputHTMLAttributes } from 'react'
import styled from 'styled-components'
import shared from './shared'

export default function TextBox(
  props: InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return <StyledTextBox {...props} />
}

const StyledTextBox = styled.input`
  ${shared}
  border-color: transparent transparent
    ${({ theme }) => theme.colors.primary500} transparent;

  &:focus,
  &:hover:focus {
    border-bottom-color: ${({ theme }) => theme.colors.accent};
  }
`
