import { Store } from "@tauri-apps/plugin-store"
import { onMounted, ref } from "vue"

export const useSettings = () => {
  const settings = ref<any>(null)

  const loadSettings = async () => {
    const store = await Store.load('company-settings.json')
    const savedSettings = await store.get('settings')
    settings.value = savedSettings as any
  }

  onMounted(async () => {
    await loadSettings()
  })

  return { settings }
}
