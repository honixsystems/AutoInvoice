import { Previewer } from 'pagedjs'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      generatePdfFromElement: async (el: HTMLElement, path: string) => {
        const previewer = new Previewer()
        const flow = await previewer.preview(el)
        const blob = await previewer.toBlob()

        // Utiliser l'API Tauri pour sauvegarder le fichier
        const { writeFile } = await import('@tauri-apps/plugin-fs')
        await writeFile(path, new Uint8Array(await blob.arrayBuffer()))
      }
    }
  }
}) 