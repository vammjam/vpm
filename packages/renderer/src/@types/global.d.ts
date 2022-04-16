declare global {
  interface Window {
    api: {
      selectFolder: () => Promise<string | undefined>
    }
  }
}

export {}
