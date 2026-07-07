import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

const paths = ['build', 'out']

for (const path of paths) {
  rmSync(resolve(path), { recursive: true, force: true })
}
