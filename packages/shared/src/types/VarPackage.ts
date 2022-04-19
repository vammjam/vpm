import {
  ContentType,
  Creator,
  Image,
  VarPackage as VarPackageSchema,
} from '@prisma/client'

export default interface VarPackage
  extends Omit<VarPackageSchema, 'creatorId'> {
  images: Omit<Image, 'varPackageId'>[]
  contentTypes: Omit<ContentType, 'varPackageId'>[]
  creator: Creator
}
