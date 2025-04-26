import { Window } from '@tauri-apps/api/window'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('appWindow', Window)
})
