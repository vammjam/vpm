import { Stats } from 'node:fs'
import { totalist } from 'totalist'

export type ListedFile = {
  name: string
  path: string
  stats: Stats
}

export default async function list(dir: string, ext: string) {
  const files: ListedFile[] = []

  await totalist(dir, (name, abs, stats) => {
    if (name.endsWith(ext)) {
      const file: ListedFile = {
        name,
        path: abs,
        stats,
      }

      files.push(file)
    }
  })

  return files
}
