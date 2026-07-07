import { app, BrowserWindow, shell, Menu, nativeImage } from 'electron'
import { join, extname } from 'path'
import { createServer } from 'http'
import { readFile } from 'fs/promises'
import { appendFileSync, mkdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
}

// Fixed port ensures a stable origin (http://localhost:PORT) across restarts,
// which is required for Firebase auth persistence (localStorage/IndexedDB is keyed by origin).
const LOCAL_SERVER_PORT = 49821

let serverPort = LOCAL_SERVER_PORT
let mainWindow: BrowserWindow | null = null

function log(message: string): void {
  const line = `[${new Date().toISOString()}] ${message}\n`
  console.log(line.trim())

  try {
    const userData = app.getPath('userData')
    mkdirSync(userData, { recursive: true })
    appendFileSync(join(userData, 'main.log'), line)
  } catch {
    // Ignore logging failures; startup should never depend on diagnostics.
  }
}

process.on('uncaughtException', (error) => {
  log(`uncaughtException: ${error.stack || error.message}`)
})

process.on('unhandledRejection', (reason) => {
  log(`unhandledRejection: ${reason instanceof Error ? reason.stack || reason.message : String(reason)}`)
})

function startLocalServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const rendererDir = join(__dirname, '../renderer')
    log(`Starting renderer server from ${rendererDir}`)
    const server = createServer(async (req, res) => {
      const url = new URL(req.url || '/', 'http://localhost')
      const pathname = decodeURIComponent(url.pathname)
      const filePath = join(rendererDir, pathname === '/' ? 'index.html' : pathname)

      try {
        const data = await readFile(filePath)
        const mimeType = MIME_TYPES[extname(filePath)] || 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': mimeType })
        res.end(data)
      } catch {
        // SPA fallback — serve index.html for client-side routes
        try {
          const indexData = await readFile(join(rendererDir, 'index.html'))
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(indexData)
        } catch {
          res.writeHead(404)
          res.end('Not found')
        }
      }
    })

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        log(`Port ${LOCAL_SERVER_PORT} in use; falling back to a random local port`)
        server.listen(0, 'localhost')
        return
      }
      log(`Renderer server error: ${error.stack || error.message}`)
      reject(error)
    })

    server.on('listening', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : LOCAL_SERVER_PORT
      log(`Renderer server listening on port ${port}`)
      resolve(port)
    })

    server.listen(LOCAL_SERVER_PORT, 'localhost')
  })
}

function createWindow(): void {
  log('Creating main window')
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon,
    autoHideMenuBar: true,
    ...(process.platform === 'darwin'
      ? {
          titleBarStyle: 'hiddenInset' as const,
          trafficLightPosition: { x: 15, y: 15 }
        }
      : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('closed', () => {
    log('Main window closed')
    mainWindow = null
  })

  // Only apply CSP in production — Vite dev server needs inline scripts for HMR
  if (!is.dev) {
    mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' https://apis.google.com https://*.firebaseapp.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.googleapis.com; " +
              "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com; " +
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com; " +
              "font-src 'self' data:;"
          ]
        }
      })
    })
  }

  const showMainWindow = (): void => {
    if (!mainWindow || mainWindow.isDestroyed() || mainWindow.isVisible()) return
    log('Showing main window')
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
  }

  mainWindow.on('ready-to-show', showMainWindow)
  mainWindow.webContents.on('did-finish-load', showMainWindow)
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    log(`Failed to load renderer (${errorCode}): ${errorDescription}`)
  })
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    log(`Renderer process gone: ${details.reason} (${details.exitCode})`)
  })
  setTimeout(showMainWindow, 3000)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    const url = details.url
    // Allow Firebase/Google auth popups to open in-app
    if (
      url.startsWith('https://accounts.google.com/') ||
      url.includes('/__/auth/handler') ||
      url.includes('.firebaseapp.com')
    ) {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          autoHideMenuBar: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
          }
        }
      }
    }
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    log(`Loading dev renderer ${process.env['ELECTRON_RENDERER_URL']}`)
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    const rendererUrl = `http://localhost:${serverPort}/index.html`
    log(`Loading production renderer ${rendererUrl}`)
    mainWindow.loadURL(rendererUrl)
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  log('Another TMX Notes instance already has the single-instance lock; quitting')
  app.quit()
} else {
  app.whenReady().then(async () => {
    log('App ready')
    electronApp.setAppUserModelId('com.tmx.notes')

    // Start local server in production so the app has an http:// origin
    // Firebase signInWithPopup rejects file:// and custom protocol origins
    if (!is.dev) {
      serverPort = await startLocalServer()
    }

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    Menu.setApplicationMenu(null)
    registerIpcHandlers()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('second-instance', () => {
    log('Second instance requested; surfacing existing window')
    // Re-launching (e.g. clicking the app icon in GNOME's "Show Apps") starts a
    // second process that quits on the single-instance lock and fires this event.
    if (!mainWindow) {
      createWindow()
      return
    }
    if (mainWindow.isMinimized()) mainWindow.restore()
    if (!mainWindow.isVisible()) mainWindow.show()
    // Wayland forbids a background app from focusing itself, so focus() alone is a
    // no-op there. Briefly toggling alwaysOnTop forces the compositor to raise the
    // window to the front; we drop it immediately so it behaves normally afterward.
    mainWindow.setAlwaysOnTop(true)
    mainWindow.focus()
    mainWindow.setAlwaysOnTop(false)
  })
}

app.on('window-all-closed', () => {
  log('All windows closed')
  if (process.platform !== 'darwin') app.quit()
})
