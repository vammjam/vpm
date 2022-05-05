import { enumify } from './Enumify'

const Enumify = enumify()

export class HubPackageType extends Enumify {
  static readonly ASSET = new HubPackageType('Assets', 1)
  static readonly CLOTHING = new HubPackageType('Clothing', 2)
  static readonly GUIDE = new HubPackageType('Guides', 3)
  static readonly HAIRSTYLE = new HubPackageType('Hairstyle', 4)
  static readonly LOOK = new HubPackageType('Looks', 5)
  static readonly MORPH = new HubPackageType('Morphs', 6)
  static readonly OTHER = new HubPackageType('Other', 7)
  static readonly PLUGIN = new HubPackageType('Plugins', 8)
  static readonly SCENE = new HubPackageType('Scenes', 9)
  static readonly TEXTURE = new HubPackageType('Textures', 10)
}

export class HubCategory extends Enumify {
  static readonly FREE = new HubCategory('Free', 1)
  static readonly PAID = new HubCategory('Paid', 2)
  static readonly PAID_EARLY_ACCESS = new HubCategory('Paid Early Access', 3)
}
