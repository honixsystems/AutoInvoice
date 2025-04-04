<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { Store } from '@tauri-apps/plugin-store'

const schema = z.object({
  autoUpdate: z.boolean(),
  enableVente: z.boolean(),
  enableTransport: z.boolean()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  autoUpdate: true,
  enableVente: true,
  enableTransport: true
})

type Feature = {
  name: keyof Schema
  label: string
  description: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const features: Feature[] = [
  {
    name: 'enableVente',
    label: 'Facturation de vente',
    description: 'Permet de créer et gérer des factures pour la vente de véhicules',
    icon: 'i-heroicons-credit-card',
    color: 'primary'
  },
  {
    name: 'enableTransport',
    label: 'Facturation de transport',
    description: 'Permet de créer et gérer des factures pour le transport de véhicules',
    icon: 'i-heroicons-truck',
    color: 'primary'
  }
]

const toast = useToast()

const emit = defineEmits<{
  saving: [boolean]
}>()

onMounted(async () => {
  try {
    const store = await Store.load('app-settings.json')
    const savedSettings = await store.get('settings')
    if (savedSettings) {
      Object.assign(state, savedSettings)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  }
})

// Watcher pour sauvegarder automatiquement les changements
watch(state, async (newState) => {
  try {
    emit('saving', true)
    const store = await Store.load('app-settings.json')
    await store.set('settings', newState)
    await store.save()
    emit('saving', false)
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    emit('saving', false)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la sauvegarde.',
      color: 'error'
    })
  }
}, { deep: true })
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-16">
    <div class="grid grid-cols-1 gap-12">
      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Mises à jour</h3>
          <p class="text-sm text-gray-500">Configurez les paramètres de mise à jour de l'application</p>
        </div>

        <UFormField label="Mises à jour automatiques" name="autoUpdate">
          <USwitch v-model="state.autoUpdate" />
        </UFormField>
      </div>

      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Fonctionnalités</h3>
          <p class="text-sm text-gray-500">Activez ou désactivez les fonctionnalités selon vos besoins</p>
        </div>
        
        <div class="grid gap-6">
          <UCard
            v-for="feature in features"
            :key="feature.name"
            class="transition-all duration-200"
            :class="{ 'opacity-75': !state[feature.name] }"
          >
            <div class="flex items-start gap-4">
              <div :class="`p-2 rounded-lg bg-${feature.color}-100`">
                <UIcon
                  :name="feature.icon"
                  class="w-6 h-6"
                  :class="`text-${feature.color}-500`"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-900">{{ feature.label }}</h4>
                  <USwitch
                    v-model="state[feature.name]"
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">{{ feature.description }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UForm>
</template>
