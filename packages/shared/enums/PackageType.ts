import { enumify } from './Enumify'

const Enumify = enumify()

export default class PackageType extends Enumify {
  static readonly ADDON_PACKAGE = new PackageType('Addon Package', 1)
  static readonly APPEARANCE = new PackageType('Appearance', 2)
  static readonly ASSET_BUNDLE = new PackageType('Asset Bundle', 3)
  static readonly CLOTHING = new PackageType('Clothing', 4)
  static readonly FAVORITE = new PackageType('Favorite', 5)
  static readonly HAIR = new PackageType('Hair', 6)
  static readonly LEGACY_SCENE = new PackageType('Legacy Scene', 7)
  static readonly MANIFEST = new PackageType('Manifest', 8)
  static readonly MORPH = new PackageType('Morph', 9)
  static readonly POSE = new PackageType('Pose', 10)
  static readonly PRESET = new PackageType('Preset', 11)
  static readonly SCENE = new PackageType('Scene', 12)
  static readonly SCRIPT = new PackageType('Script', 13)
}
