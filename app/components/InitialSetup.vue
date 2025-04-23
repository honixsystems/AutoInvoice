<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration initiale</h1>
      <p class="text-lg text-gray-600">Bienvenue dans AutoInvoice. Configurons votre application pour commencer.</p>
    </div>

    <UStepper v-model="currentStep" :items="steps" class="w-full">
      <template #company>
        <div class="space-y-6">
          <div class="flex flex-col">
            <h3 class="text-lg font-semibold text-gray-900">Identité de l'entreprise</h3>
            <p class="text-sm text-gray-500">Configurez les informations de base de votre entreprise</p>
          </div>

          <UForm ref="companyFormRef" :schema="companySchema" :state="companyState" class="space-y-4">
            <UFormField label="Logo de l'entreprise" class="md:col-span-2">
              <div class="flex items-center gap-4">
                <img v-if="logoPreview" :src="logoPreview" alt="Logo actuel" class="w-32 h-32 object-contain">
                <UInput type="file" accept="image/*" @change="handleLogoChange" class="flex-1" />
              </div>
            </UFormField>

            <UFormField label="Raison sociale" name="companyName">
              <UInput v-model="companyState.companyName" placeholder="Nom de votre entreprise" class="w-full" />
            </UFormField>

            <UFormField label="Numéro de téléphone" name="phoneNumber">
              <UInput v-model="companyState.phoneNumber" type="tel" placeholder="+33 1 23 45 67 89" class="w-full" />
            </UFormField>

            <UFormField label="Adresse" name="address">
              <UTextarea v-model="companyState.address" placeholder="Adresse complète" :rows="3" class="w-full" />
            </UFormField>

            <UFormField label="Numéro de TVA" name="vatNumber">
              <UInput v-model="companyState.vatNumber" placeholder="FR12345678900" class="w-full" />
            </UFormField>

            <div class="flex items-center gap-4">
              <UFormField label="Taux de TVA (%)" name="vatRate" class="w-full">
                <UInput v-model="companyState.vatRate" type="number" min="0" max="100" step="0.1" class="w-full" />
              </UFormField>
              <UFormField label="Afficher la TVA" name="displayVAT" class="w-full">
                <USwitch v-model="companyState.displayVAT" />
              </UFormField>
            </div>

            <UFormField label="IBAN" name="iban">
              <UInput v-model="companyState.iban" placeholder="FR7630001007941234567890189" class="w-full" />
            </UFormField>

            <UFormField label="BIC" name="bic">
              <UInput v-model="companyState.bic" placeholder="BNPAFRPP" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #features>
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
              :class="{ 'opacity-75': !appState[feature.name] }"
            >
              <div class="flex items-start gap-4">
                <div>
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
                      v-model="appState[feature.name]"
                    />
                  </div>
                  <p class="mt-1 text-sm text-gray-500">{{ feature.description }}</p>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </UStepper>

    <div class="flex flex-col gap-4 justify-between mt-6">
      <UButton
        size="lg"
        class="w-full flex justify-center items-center"
        v-if="currentStep > 0"
        color="neutral"
        variant="ghost"
        @click="prevStep"
      >
        Précédent
      </UButton>
      <UButton
        size="lg"
        class="w-full flex justify-center items-center"
        v-if="currentStep < 2"
        color="primary"
        @click="nextStep"
      >
        Suivant
      </UButton>
      <UButton
        size="lg"
        class="w-full flex justify-center items-center"
        v-if="currentStep === 2"
        color="primary"
        @click="finishSetup"
      >
        Commencer
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { StepperItem } from '@nuxt/ui'
import { Store } from '@tauri-apps/plugin-store'
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs'
import { useSettings } from '~/composables/useSettings'

const router = useRouter()
const toast = useToast()
const { loadSettings } = useSettings()

const companySchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  phoneNumber: z.string().min(1, 'Le numéro de téléphone est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  vatNumber: z.string().min(1, 'Le numéro de TVA est requis'),
  vatRate: z.number().min(0).max(100).step(0.1, 'Le taux de TVA doit être entre 0 et 100'),
  displayVAT: z.boolean(),
  logoUrl: z.string().optional(),
  iban: z.string().regex(/^[A-Z]{2}[0-9A-Z]+$/, 'Format IBAN invalide'),
  bic: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Format BIC invalide')
})

const appSchema = z.object({
  autoUpdate: z.boolean(),
  enableVente: z.boolean(),
  enableTransport: z.boolean()
})

type CompanySchema = z.output<typeof companySchema>
type AppSchema = z.output<typeof appSchema>

const companyState = reactive<Partial<CompanySchema>>({
  companyName: undefined,
  phoneNumber: undefined,
  address: undefined,
  vatNumber: undefined,
  vatRate: 20,
  displayVAT: true,
  logoUrl: undefined,
  iban: undefined,
  bic: undefined
})

const appState = reactive<Partial<AppSchema>>({
  autoUpdate: true,
  enableVente: true,
  enableTransport: true
})

const currentStep = ref(0)
const companyFormRef = ref()

const steps: StepperItem[] = [
  {
    slot: 'company',
    title: 'Entreprise',
    description: 'Informations de l\'entreprise',
    icon: 'i-heroicons-building-office'
  },
  {
    slot: 'features',
    title: 'Fonctionnalités',
    description: 'Configuration des fonctionnalités',
    icon: 'i-heroicons-cog-6-tooth'
  },
  {
    slot: 'finish',
    title: 'Terminé',
    description: 'Configuration terminée',
    icon: 'i-heroicons-check-circle'
  }
]

const features: { name: keyof AppSchema; label: string; description: string; icon: string; color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' }[] = [
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

const logoPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)

async function handleLogoChange(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    logoFile.value = input.files[0]
    logoPreview.value = URL.createObjectURL(input.files[0])
  }
}

const nextStep = async () => {
  let isValid = true
  
  if (currentStep.value === 0) {
    isValid = await companyFormRef.value?.validate()
  }

  if (!isValid) return

  if (currentStep.value === 1) {
    await finishSetup()
    return
  }

  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

const finishSetup = async () => {
  try {
    // Sauvegarder les paramètres de l'entreprise
    const companyStore = await Store.load('company-settings.json')
    await companyStore.set('settings', companyState)
    await companyStore.save()

    // Sauvegarder le logo si un nouveau fichier a été sélectionné
    if (logoFile.value) {
      const arrayBuffer = await logoFile.value.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      await writeFile('logo.png', uint8Array, { baseDir: BaseDirectory.AppLocalData })
    }

    // Sauvegarder les paramètres de l'application
    const appStore = await Store.load('app-settings.json')
    await appStore.set('settings', appState)
    await appStore.save()

    // Recharger les paramètres
    await loadSettings()

    // Rediriger vers la page de succès
    router.push('/setup-success')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la sauvegarde.',
      color: 'error'
    })
  }
}
</script> 