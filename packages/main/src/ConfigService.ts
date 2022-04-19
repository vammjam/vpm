import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Config } from '@shared/types'

const filePath = path.resolve(process.cwd(), './config.json')

export const saveConfig = async (data: Partial<Config>) => {
  const currentConfig = await getConfig()
  const newConfig = { ...currentConfig, ...data }

  await fs.writeFile(filePath, JSON.stringify(newConfig, null, 2))

  return newConfig
}

export const getConfig = async (): Promise<Config> => {
  try {
    const file = await fs.readFile(filePath, 'utf8')

    return JSON.parse(file) as Config
  } catch (err) {
    return {}
  }
}
