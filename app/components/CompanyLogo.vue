<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useSettings } from '~/composables/useSettings'

const { companySettings } = useSettings()
const logoUrl = ref<string | null>(null)

const updateLogoUrl = () => {
  if (companySettings.value?.logoData) {
    const blob = new Blob([companySettings.value.logoData], { type: 'image/png' })
    logoUrl.value = URL.createObjectURL(blob)
  } else {
    logoUrl.value = null
  }
}

onMounted(updateLogoUrl)
watch(() => companySettings.value?.logoData, updateLogoUrl)
</script>

<template>
  <img v-if="logoUrl" :src="logoUrl" alt="Logo de l'entreprise" class="w-[180px] h-auto">
</template>