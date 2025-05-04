<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { getLicenseKey, validateStoredLicense, deactivateStoredLicense } from '~/utils/license'
import { useSettings } from '~/composables/useSettings'

const schema = z.object({
  enableVente: z.boolean(),
  enableTransport: z.boolean(),
  enableGarage: z.boolean()
})

type Schema = z.output<typeof schema>

const { appSettings } = useSettings()

const licenseState = reactive({
  key: '',
  isValid: false,
  loading: false,
  checking: false
})

const isDeactivateModalOpen = ref(false)

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

const toast = useToast()

const emit = defineEmits<{
  saving: [boolean]
}>()

onMounted(async () => {
  try {
    // Charger les informations de la licence
    const licenseKey = await getLicenseKey()
    if (licenseKey) {
      licenseState.key = licenseKey
      licenseState.checking = true
      const validation = await validateStoredLicense()
      licenseState.isValid = validation.valid
    }
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres:', error)
  } finally {
    licenseState.checking = false
  }
})

// Watcher pour gérer l'état de sauvegarde
watch(appSettings, (newSettings) => {
  if (newSettings) {
    emit('saving', true)
    setTimeout(() => {
      emit('saving', false)
    }, 1000)
  }
}, { deep: true })

const handleDeactivateLicense = async () => {
  try {
    licenseState.loading = true
    const result = await deactivateStoredLicense()
    if (result.valid) {
      licenseState.key = ''
      licenseState.isValid = false
      toast.add({
        title: 'Succès',
        description: 'La licence a été désactivée avec succès.',
        color: 'success'
      })
      navigateTo('/setup')
    } else {
      toast.add({
        title: 'Erreur',
        description: result.message,
        color: 'error'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la désactivation de la licence.',
      color: 'error'
    })
  } finally {
    licenseState.loading = false
    isDeactivateModalOpen.value = false
  }
}
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

      <!-- Section Licence -->
      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Licence</h3>
          <p class="text-sm text-gray-500">Gérez votre licence d'utilisation</p>
        </div>

        <UCard>
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-medium text-gray-900">Licence actuelle</h4>
              <p class="mt-1 text-sm text-gray-500">
                {{ licenseState.key ? `${licenseState.key.substring(0, 10)}...` : 'Aucune licence active' }}
              </p>
              <p class="mt-1 text-sm" :class="licenseState.isValid ? 'text-green-500' : 'text-red-500'">
                <template v-if="licenseState.checking">
                  <div class="flex items-center gap-2 text-gray-500">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
                    Vérification en cours...
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2">
                    <UIcon :name="licenseState.isValid ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" class="w-4 h-4" :class="licenseState.isValid ? 'text-green-500' : 'text-red-500'" />
                    {{ licenseState.isValid ? 'Licence valide' : 'Licence invalide' }}
                  </div>
                </template>
              </p>
            </div>
            <UButton
              v-if="licenseState.key"
              color="error"
              variant="soft"
              :loading="licenseState.loading"
              @click="isDeactivateModalOpen = true"
            >
              Désactiver la licence
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </UForm>

  <!-- Modal de confirmation de désactivation -->
  <UModal
    v-model:open="isDeactivateModalOpen"
  >
    <template #title>
      <h4 class="font-medium text-gray-900">Désactivation de la licence</h4>
    </template>
    <template #body>
      <p class="text-gray-700">
        Êtes-vous sûr de vouloir désactiver votre licence ? Vous devrez entrer une nouvelle licence pour continuer à utiliser le logiciel.
      </p>
      <p class="text-gray-400 text-sm mt-4">
        Note: Si vous désactivez votre licence, vous pourrez l'utiliser sur un autre appareil.
      </p>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          label="Annuler"
          @click="isDeactivateModalOpen = false"
        />
        <UButton
          color="error"
          label="Désactiver"
          :loading="licenseState.loading"
          @click="handleDeactivateLicense"
        />
      </div>
    </template>
  </UModal>
</template>
