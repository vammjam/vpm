import { enumify } from './Enumify'

const Enumify = enumify()

export default class PresetType extends Enumify {
  static ANIMATION = new PresetType('Animation', 1)
  static APPEARANCE = new PresetType('Appearance', 2)
  static BREAST = new PresetType('Breast', 3)
  static CLOTHING = new PresetType('Clothing', 4)
  static GLUTE = new PresetType('Glute', 5)
  static HAIR = new PresetType('Hair', 6)
  static MORPH = new PresetType('Morph', 7)
  static POSE = new PresetType('Pose', 8)
  static SKIN = new PresetType('Skin', 9)
}
