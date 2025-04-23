import { Store } from "@tauri-apps/plugin-store"
import { onMounted, ref } from "vue"
import type { CompanySettings, AppSettings } from "~/types/settings"
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs'

export const useSettings = () => {
  const companySettings = ref<CompanySettings | null>(null)
  const appSettings = ref<AppSettings | null>(null)

  const loadSettings = async () => {
    try {
      // Charger les paramètres de l'entreprise
      const companyStore = await Store.load('company-settings.json')
      const savedCompanySettings = await companyStore.get('settings')
      if (savedCompanySettings) {
        companySettings.value = savedCompanySettings as CompanySettings
      }

      // Charger les paramètres de l'application
      const appStore = await Store.load('app-settings.json')
      const savedAppSettings = await appStore.get('settings')
      if (savedAppSettings) {
        appSettings.value = savedAppSettings as AppSettings
      }

      // Charger le logo
      try {
        const logo = await readFile('logo.png', { baseDir: BaseDirectory.AppLocalData })
        if (companySettings.value) {
          companySettings.value.logoData = new Uint8Array(logo)
        }
      } catch (error) {
        console.log('Aucun logo existant')
        if (companySettings.value) {
          companySettings.value.logoData = undefined
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error)
    }
  }

  onMounted(async () => {
    await loadSettings()
  })

  return { 
    companySettings,
    appSettings,
    loadSettings
  }
}
