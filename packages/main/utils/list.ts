import { Stats } from 'node:fs'
import path from 'node:path'
import { totalist } from 'totalist'

export type ListedFile = {
  name: string
  path: string
  stats: Stats
}

export default async function list(dir: string, ext: string) {
  const files: ListedFile[] = []

  try {
    await totalist(dir, (name, abs, stats) => {
      if (name.endsWith(ext)) {
        const file: ListedFile = {
          name: path.basename(name),
          path: abs,
          stats,
        }

        files.push(file)
      }
    })
  } catch {
    // ignore
  }

  return files
}
