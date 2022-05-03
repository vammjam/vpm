import Color from 'color'
import { css } from 'styled-components'

export const active = css`
  background-color: rgba(200 200 200 / 1%);
  border-color: rgba(255 255 255 / 4%);
`

const shared = css`
  background: ${({ theme }) => theme.colors.primary850};
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  border-color: rgba(255 255 255 / 0.05);
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.primary};
  font-family: inherit;
  font-size: 14px;
  min-height: 32px;
  min-width: 28px;
  line-height: 32px;
  padding: 0 10px;
  transition-duration: 0.1s;
  transition-property: background-color, border-color;
  transition-timing-function: ease-out;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) =>
      Color(theme.colors.surface).lighten(0.4).hex()};

    &button {
      border-color: ${({ theme }) => theme.colors.primary800};
    }
  }

  &:disabled {
    background: rgba(0 0 0 / 1%);
    border-color: ${({ theme }) => theme.colors.primary850};
    color: ${({ theme }) => theme.colors.primary650};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

export default shared
