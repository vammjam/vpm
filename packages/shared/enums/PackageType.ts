import { enumify } from './Enumify'

const Enumify = enumify()

export default class PackageType extends Enumify {
  static ADDON_PACKAGE = new PackageType('Addon Package', 1)
  static APPEARANCE = new PackageType('Appearance', 2)
  static ASSET_BUNDLE = new PackageType('Asset Bundle', 3)
  static CLOTHING = new PackageType('Clothing', 4)
  static FAVORITE = new PackageType('Favorite', 5)
  static HAIR = new PackageType('Hair', 6)
  static LEGACY_SCENE = new PackageType('Legacy Scene', 7)
  static MANIFEST = new PackageType('Manifest', 8)
  static MORPH = new PackageType('Morph', 9)
  static POSE = new PackageType('Pose', 10)
  static PRESET = new PackageType('Preset', 11)
  static SCENE = new PackageType('Scene', 12)
  static SCRIPT = new PackageType('Script', 13)
}
