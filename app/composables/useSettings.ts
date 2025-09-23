import { Store } from "@tauri-apps/plugin-store"
import { onMounted, ref, watch } from "vue"
import type { CompanySettings, AppSettings } from "~/types/settings"
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs'
import { shadesOf } from "~/utils/theme"

// Créer des refs globales pour partager l'état
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
      const settings = savedAppSettings as AppSettings
      // Migration : s'assurer que les paramètres spécifiques existent
      if (!settings.transportSettings) {
        settings.transportSettings = {
          pricePerKm: 1,
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        }
      }
      if (!settings.venteSettings) {
        settings.venteSettings = {
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        }
      }
      if (!settings.garageSettings) {
        settings.garageSettings = {
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        }
      }
      appSettings.value = settings
    } else {
      // Initialiser avec des valeurs par défaut
      appSettings.value = {
        enableVente: true,
        enableTransport: true,
        enableGarage: false,
        transportSettings: {
          pricePerKm: 1,
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        },
        venteSettings: {
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        },
        garageSettings: {
          defaultMention: '',
          vat: {
            vatRate: 20,
            displayVAT: true
          }
        }
      }
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

    // Charger les couleurs personnalisées
    try {
      const customThemeColor = companySettings.value?.primaryColor
      if (customThemeColor) {
        const shades = shadesOf(customThemeColor)
        for (const shade in shades) {
          document.documentElement.style.setProperty(`--color-customtheme-${shade}`, shades[shade] ?? '')
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des couleurs personnalisées:', error)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
}

// Watcher pour les paramètres de l'application
watch(appSettings, async (newSettings) => {
  if (newSettings) {
    try {
      const appStore = await Store.load('app-settings.json')
      await appStore.set('settings', newSettings)
      await appStore.save()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error)
    }
  }
}, { deep: true })

// Charger les paramètres au démarrage
loadSettings()

export const useSettings = () => {
  return { 
    companySettings,
    appSettings,
    loadSettings
  }
}
