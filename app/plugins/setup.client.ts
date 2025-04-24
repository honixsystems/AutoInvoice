import { Store } from "@tauri-apps/plugin-store"
import type { CompanySettings, AppSettings } from "~/types/settings"

export default defineNuxtPlugin(async () => {
    const router = useRouter();
    try {
        // Vérifier si l'application est configurée
        const companyStore = await Store.load('company-settings.json')
        const companySettings = await companyStore.get('settings') as CompanySettings | null
        const appStore = await Store.load('app-settings.json')
        const appSettings = await appStore.get('settings') as AppSettings | null

        // Si aucune configuration n'est détectée, rediriger vers la page de setup
        if (!companySettings || !appSettings) {
            router.push('/setup')
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du setup:', error)
        router.push('/setup')
    }
})
