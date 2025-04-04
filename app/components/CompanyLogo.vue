<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs'

const logoUrl = ref<string | null>(null)

onMounted(async () => {
  try {
    const logoData = await readFile('logo.png', { baseDir: BaseDirectory.AppLocalData })
    const blob = new Blob([logoData], { type: 'image/png' })
    logoUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.log('Aucun logo existant')
  }
})
</script>

<template>
  <img v-if="logoUrl" :src="logoUrl" alt="Logo de l'entreprise" class="company-logo">
  <img v-else src="/images/logo.png" alt="Logo par défaut" class="company-logo">
</template>

<style scoped>
.company-logo {
  max-width: 180px;
  height: auto;
}
</style> 