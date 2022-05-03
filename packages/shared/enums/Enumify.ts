export interface IEnumify {
  name: string
  value: number
  // returns "name"
  toString(): string
  // returns "value"
  toJSON(): number
}

/**
 * Creates a slightly enhanced form of enum types, capable
 * of containing additional metadata
 * @param startsAt The value indexes begin with. Default = 0
 * @returns A new "enumified" type
 */
export const enumify = (): typeof Enumify => {
  const enums: IEnumify[] = []

  const Enumify = class implements IEnumify {
    value: number
    name: string

    static enums(): IEnumify[] {
      return enums
    }

    static values(): number[] {
      return Object.values(enums).map(({ value }) => value)
    }

    static keys(): string[] {
      return Object.values(enums).map(({ name }) => name)
    }

    static fromValue(value?: number | string | null): IEnumify | undefined {
      const isStr = typeof value === 'string'

      return enums.find((e) => (isStr ? e.value.toString() : e.value) === value)
    }

    static fromName(name = ''): IEnumify | undefined {
      return enums.find((e) => e.name.toLowerCase() === name.toLowerCase())
    }

    constructor(name: string, value: number) {
      this.value = value
      this.name = name

      enums.push(this)
    }

    toString(): string {
      return this.name
    }

    toJSON(): number {
      return this.value
    }
  }

  return Enumify
}
