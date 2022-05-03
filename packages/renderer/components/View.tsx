import * as CSS from 'csstype'
import styled, { css } from 'styled-components'

export type ViewProps = {
  children?: React.ReactNode
  $align?: CSS.Property.AlignItems
  $justify?: CSS.Property.JustifyContent
  $dir?: CSS.Property.Direction
  $wrap?: CSS.Property.FlexWrap
}

const View = styled.div<ViewProps>`
  display: flex;
  ${({ $wrap }) =>
    $wrap &&
    css`
      flex-wrap: ${$wrap};
    `}
  ${({ $align }) =>
    $align &&
    css`
      align-items: ${$align};
    `}
  ${({ $justify }) =>
    $justify &&
    css`
      justify-content: ${$justify};
    `}
    ${({ $dir }) =>
    $dir &&
    css`
      flex-direction: ${$dir};
    `}
`

export default View

export const StackedView = styled(View)`
  flex-direction: column;

  > * {
    flex: 1;
  }
`
