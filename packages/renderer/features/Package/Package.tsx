import { capitalCase } from 'capital-case'
import { ReactNode, useMemo } from 'react'
import { VscCircleFilled, VscCircleLargeOutline } from 'react-icons/vsc'
import styled, { css } from 'styled-components'
import { PackageType } from '@shared/enums'
import { AddonPackage, Image } from '@shared/types'
import { View } from '~/components'

export type PackageProps = {
  data: AddonPackage
  versions: number
  selected: boolean
  onChange: (isSelected: boolean, pkg?: AddonPackage) => void
}

const Title = styled.h1`
  font-size: 0.9rem;
`

const Small = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.7rem;
`

export default function Package({
  data,
  versions,
  selected,
  onChange,
}: PackageProps): JSX.Element {
  const formattedName = useMemo(
    () => formatName(data.package.name),
    [data.package.name]
  )

  const packageType = useMemo(() => {
    return PackageType.fromValue(data.packageTypeId)?.name
  }, [data.packageTypeId])

  return (
    <Container $selected={selected} onClick={() => onChange(!selected)}>
      <MainPackageImage $images={data.images}>
        <ImageIcon $selected={selected}>
          {selected && <VscCircleFilled />}
          <VscCircleLargeOutline />
        </ImageIcon>
      </MainPackageImage>
      <View $justify="space-between" $align="baseline">
        <Title>
          {formattedName} {versions > 0 ? `(${versions + 1})` : ''}
        </Title>
        <Small>{data.creator.name}</Small>
      </View>
      <Tags>
        <Tag>{packageType}</Tag>
      </Tags>
      {/* <Paragraph>{parseDescription(pkg.description)}</Paragraph> */}
    </Container>
  )
}

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  font-size: x-small;
  background: ${({ theme }) => theme.colors.surface600};
`

const Tags = styled.div`
  display: inline-flex;
  flex-wrap: wrap;

  > ${Tag} {
    margin-right: 0.2rem;
  }
`

const MainImage = styled.img`
  border-radius: 0.5rem;
  object-fit: cover;
  width: 100%;
`

const Container = styled.div<{ $selected: boolean }>`
  padding: 0.5rem;
  overflow-wrap: break-word;
  border-radius: 0.5rem;
  transition: background-color 0.2s ease-in-out;
  border: 1px solid transparent;

  ${MainImage} {
    transition: transform 0.2s ease-in-out;
  }

  ${({ $selected, theme }) =>
    $selected
      ? css`
          background-color: ${theme.colors.surface50};
          border: 1px solid ${theme.colors.accent};

          ${MainImage} {
            transform: scale(0.97);
          }

          &:hover {
            background-color: ${theme.colors.surface300};
          }
        `
      : css`
          &:hover {
            background-color: ${theme.colors.primary850};

            ${MainImage} {
              transform: scale(0.98);
            }
          }
        `}
`

const ImageIcon = styled.div<{ $selected: boolean }>`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;

  ${({ $selected, theme }) =>
    $selected &&
    css`
      color: ${theme.colors.accent};
    `}

  > svg {
    position: absolute;
  }
`

const ImageContainer = styled.div`
  position: relative;
`

const MainPackageImage: React.FC<{
  $images?: Omit<Image, 'addonPackageId'>[]
  children?: ReactNode
}> = ({ $images, children }) => {
  const sorted = $images?.sort((a, b) => b.sort - a.sort)
  const mainThumbnail = sorted?.[0]

  return (
    <ImageContainer>
      {mainThumbnail && <MainImage src={mainThumbnail.path} />}
      {children}
    </ImageContainer>
  )
}

const formatName = (name: string) => {
  return capitalCase(name, {
    transform: (word: string) => {
      const newWord = word.replaceAll(/vam/gi, 'VaM ')

      return newWord.split(' ').reduce((result, splitWord) => {
        return `${result} ${splitWord[0].toUpperCase() + splitWord.slice(1)}`
      }, '')
    },
  })
}

// const formatDescription = (description: string | null) => {
//   if (description && description.length > 100) {
//     return `${description?.substring(0, 100)}...`
//   }

//   return description
// }
