<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useSettings } from '~/composables/useSettings'

const schema = z.object({
  enableVente: z.boolean(),
  enableTransport: z.boolean(),
  enableGarage: z.boolean()
})

type Schema = z.output<typeof schema>

const { appSettings } = useSettings()

type Feature = {
  name: keyof Schema
  label: string
  description: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  disabled?: boolean
}

const features: Feature[] = [
  {
    name: 'enableVente',
    label: 'Facturation de vente',
    description: 'Permet de créer et gérer des factures pour la vente de véhicules',
    icon: 'i-heroicons-credit-card',
    color: 'primary',
    disabled: false
  },
  {
    name: 'enableTransport',
    label: 'Facturation de transport',
    description: 'Permet de créer et gérer des factures pour le transport de véhicules',
    icon: 'i-heroicons-truck',
    color: 'primary',
    disabled: false
  },
  {
    name: 'enableGarage',
    label: 'Facturation de garage',
    description: 'Permet de créer et gérer des factures pour votre garage',
    icon: 'i-heroicons-wrench-screwdriver',
    color: 'primary',
    disabled: true
  }
]

const emit = defineEmits<{
  saving: [boolean]
}>()

// Watcher pour gérer l'état de sauvegarde
watch(appSettings, (newSettings) => {
  if (newSettings) {
    emit('saving', true)
    setTimeout(() => {
      emit('saving', false)
    }, 1000)
  }
}, { deep: true })
</script>

<template>
  <UForm v-if="appSettings" :schema="schema" :state="appSettings" class="space-y-16">
    <div class="grid grid-cols-1 gap-12">
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
            :class="{ 'opacity-75': !appSettings[feature.name] || feature.disabled }"
          >
            <div class="flex items-start gap-4">
              <div :class="`rounded-lg`">
                <UIcon
                  :name="feature.icon"
                  class="w-6 h-6"
                  :class="`text-${feature.color}-500`"
                />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="font-medium text-gray-900">{{ feature.label }}</h4>
                  <div class="flex items-center gap-2">
                    <UBadge v-if="feature.disabled" color="neutral" variant="soft">Bientôt disponible</UBadge>
                    <USwitch
                      v-model="appSettings[feature.name]"
                      :disabled="feature.disabled"
                    />
                  </div>
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
