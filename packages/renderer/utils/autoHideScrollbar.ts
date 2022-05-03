import { css } from 'styled-components'

export default function autoHideScrollbar(dir: 'x' | 'y' | 'both') {
  return css`
    overflow-y: ${dir === 'x' ? 'hidden' : 'auto'};
    overflow-x: ${dir === 'y' ? 'hidden' : 'auto'};

    &::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.surface};
    }

    &:hover::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.colors.primary600};
    }
  `
}
