declare global {
  interface Window {
    electronAPI: {
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      platform: string
      getVersion: () => Promise<string>
    }
  }
}

export {}
