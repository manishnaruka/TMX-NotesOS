import { chmodSync, cpSync, mkdirSync, readdirSync, readlinkSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const rootDir = resolve(import.meta.dirname, '..')
const sourceDir = join(rootDir, 'build', 'linux-unpacked')
const appDir = join(homedir(), '.local', 'share', 'tmx-notes')
const applicationsDir = join(homedir(), '.local', 'share', 'applications')
const iconsDir = join(homedir(), '.local', 'share', 'icons', 'hicolor', '1024x1024', 'apps')
const installedBinary = join(appDir, 'tmx-notes')

// A running instance keeps its binary open, which makes the copy below fail with
// ETXTBSY. Stop it first by matching processes whose actual executable is the
// installed binary (via /proc) — not by command-line text, which could match
// unrelated processes such as this script's own shell.
function stopRunningInstance() {
  let killed = 0
  for (const pid of readdirSync('/proc')) {
    if (!/^\d+$/.test(pid)) continue
    try {
      const exe = readlinkSync(`/proc/${pid}/exe`)
      if (exe === installedBinary || exe === `${installedBinary} (deleted)`) {
        process.kill(Number(pid), 'SIGTERM')
        killed++
      }
    } catch {
      // Process exited or is not ours to inspect; skip it.
    }
  }
  return killed
}

if (stopRunningInstance() > 0) {
  console.log('Stopped running TMX Notes instance before reinstalling')
  spawnSync('sleep', ['1'])
}

mkdirSync(appDir, { recursive: true })
mkdirSync(applicationsDir, { recursive: true })
mkdirSync(iconsDir, { recursive: true })

cpSync(sourceDir, appDir, { recursive: true, force: true })
cpSync(join(rootDir, 'resources', 'icon.png'), join(iconsDir, 'tmx-notes.png'), { force: true })
chmodSync(join(appDir, 'tmx-notes'), 0o755)

const desktopEntry = `[Desktop Entry]
Name=TMX Notes
Comment=A production-ready notes app built with Electron, React, and Firebase
Exec=env -u ELECTRON_RUN_AS_NODE ELECTRON_DISABLE_SANDBOX=1 ${join(appDir, 'tmx-notes')} %U
Icon=tmx-notes
Terminal=false
Type=Application
Categories=Office;
StartupWMClass=tmx-notes
`

const desktopPath = join(applicationsDir, 'tmx-notes.desktop')
writeFileSync(desktopPath, desktopEntry)
chmodSync(desktopPath, 0o644)

spawnSync('update-desktop-database', [applicationsDir], { stdio: 'ignore' })

console.log(`Installed TMX Notes app files to ${appDir}`)
console.log(`Installed desktop launcher to ${desktopPath}`)
