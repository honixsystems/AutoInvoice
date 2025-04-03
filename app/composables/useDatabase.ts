import { ref } from 'vue'
import Database from '@tauri-apps/plugin-sql'

const dbInstance = ref<Database | null>(null)
let isInitializing = false

export function useDatabase(): Database {
  if (!dbInstance.value) {
    throw new Error('La base de données n\'est pas initialisée. Assurez-vous d\'appeler initDatabase() au démarrage de l\'application.')
  }
  return dbInstance.value
}

export async function initDatabase(): Promise<void> {
  if (dbInstance.value) return
  if (isInitializing) {
    while (!dbInstance.value) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    return
  }

  isInitializing = true
  dbInstance.value = await Database.load('sqlite:autoinvoice.db')
  isInitializing = false
}
