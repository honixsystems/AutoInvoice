import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { openPath } from '@tauri-apps/plugin-opener';

export function useTypst() {
  const generateAndSavePdf = async (templateName: string, data: any) => {
    try {  
      // Récupérer les données binaires du PDF
      const fileData = await invoke<number[]>('generate_pdf', { templateName: templateName, data })
      
      // Convertir le tableau de nombres en Uint8Array
      const file = new Uint8Array(fileData)
      
      const selected = await save({
        title: 'Invoice',
        defaultPath: 'facture-' + data.config.invoiceId + '.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      
      if (selected) {
        await writeFile(selected, file)
        await openPath(selected)
      }
      
      return selected
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      throw error
    }
  }

  const generatePdf = async (templateName: string, data: any) => {
    try {
      const fileData = await invoke<number[]>('generate_pdf', { templateName: templateName, data })
      return fileData
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      throw error
    }
  }

  return {
    generateAndSavePdf,
    generatePdf
  }
}
