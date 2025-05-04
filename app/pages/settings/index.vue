<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { TabsItem } from '@nuxt/ui'
import { useSettings } from '~/composables/useSettings'
import GarageSettings from '~/components/GarageSettings.vue'

const isSaving = ref(false)
const router = useRouter()
let savingTimeout: NodeJS.Timeout | null = null
const { appSettings } = useSettings()

const items = ref<TabsItem[]>([
  {
    label: 'Mon entreprise',
    slot: 'company'
  },
  {
    label: 'Application',
    slot: 'app'
  },
  ...(appSettings.value?.enableGarage ? [{
    label: 'Mon garage',
    slot: 'garage'
  }] : [])
])

// Mettre à jour les items quand appSettings change
watch(appSettings, (newSettings) => {
  if (newSettings) {
    items.value = [
      {
        label: 'Mon entreprise',
        slot: 'company'
      },
      {
        label: 'Application',
        slot: 'app'
      },
      ...(newSettings.enableGarage ? [{
        label: 'Mon garage',
        slot: 'garage'
      }] : [])
    ]
  }
}, { deep: true })

// Fonction pour gérer l'état de l'enregistrement avec un délai minimum
const handleSavingState = (saving: boolean) => {
  if (saving) {
    isSaving.value = true
    if (savingTimeout) {
      clearTimeout(savingTimeout)
    }
  } else {
    // Attendre au moins 2 secondes avant de masquer le message
    savingTimeout = setTimeout(() => {
      isSaving.value = false
    }, 1000)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Paramètres</h1>
      <div class="flex items-center gap-4">
        <div v-if="isSaving" class="flex items-center gap-2 text-gray-500">
          <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
          <span>Enregistrement automatique</span>
        </div>
        <UButton
          color="primary"
          @click="router.back()"
          icon="i-heroicons-arrow-left"
        >
          Retour
        </UButton>
      </div>
    </div>

    <div class="flex gap-8">
      <UTabs
        orientation="vertical"
        variant="link"
        :items="items"
        class="w-full items-start gap-8"
      >
        <template #company="{ item }">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-6">{{ item.label }}</h2>
            <CompanySettings @saving="handleSavingState" />
          </div>
        </template>
        <template #app="{ item }">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-6">{{ item.label }}</h2>
            <AppSettings @saving="handleSavingState" />
          </div>
        </template>
        <template v-if="appSettings?.enableGarage" #garage="{ item }">
          <div class="flex-1">
            <h2 class="text-2xl font-bold mb-6">{{ item.label }}</h2>
            <GarageSettings @saving="handleSavingState" />
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template> 