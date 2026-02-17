import { app, BrowserWindow, shell, Menu, nativeImage } from 'electron'
import { join, extname } from 'path'
import { createServer } from 'http'
import { readFile } from 'fs/promises'
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

let serverPort = 0

function startLocalServer(): Promise<number> {
  return new Promise((resolve) => {
    const rendererDir = join(__dirname, '../renderer')
    const server = createServer(async (req, res) => {
      let filePath = join(rendererDir, req.url === '/' ? 'index.html' : req.url || 'index.html')

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

    server.listen(0, 'localhost', () => {
      const addr = server.address()
      const port = typeof addr === 'object' && addr ? addr.port : 0
      resolve(port)
    })
  })
}

function createWindow(): void {
  const icon = nativeImage.createFromPath(join(__dirname, '../../resources/icon.png'))

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    icon,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
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

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    if (is.dev) {
      mainWindow.webContents.openDevTools()
    }
  })

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
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadURL(`http://localhost:${serverPort}/index.html`)
  }
}

app.whenReady().then(async () => {
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
