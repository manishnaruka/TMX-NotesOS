import { contextBridge, ipcRenderer } from 'electron'

const api = {
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('app:version')
}

contextBridge.exposeInMainWorld('electronAPI', api)
