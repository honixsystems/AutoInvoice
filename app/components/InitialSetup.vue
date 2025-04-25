<template>
  <div class="max-w-4xl mx-auto p-6">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Configuration initiale</h1>
      <p class="text-lg text-gray-600">Bienvenue dans AutoInvoice. Configurons votre application pour commencer.</p>
    </div>

    <UStepper v-model="currentStep" :items="steps" class="w-full" disabled>
      <template #company>
        <UForm ref="companyFormRef" :schema="companySchema" :state="companyState" class="space-y-6">
          <div class="space-y-6">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900">Identité de l'entreprise</h3>
              <p class="text-sm text-gray-500">Configurez les informations légales et de contact de votre entreprise</p>
            </div>

            <div class="flex flex-col md:flex-row gap-8">
              <!-- Logo à gauche -->
              <div class="w-full md:w-48 flex-shrink-0">
                <UFormField label="Logo" class="w-full">
                  <LogoUploader 
                    :initial-logo-data="logoData"
                    @update:logo-data="updateLogoData"
                  />
                </UFormField>
              </div>

              <!-- Informations à droite -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField label="Raison sociale" name="companyName" class="md:col-span-2">
                  <UInput v-model="companyState.companyName" placeholder="Nom de votre entreprise" class="w-full" />
                </UFormField>

                <UFormField label="Numéro de TVA" name="vatNumber">
                  <UInput v-model="companyState.vatNumber" placeholder="FR12345678900" class="w-full" />
                </UFormField>

                <UFormField label="Numéro de téléphone" name="phoneNumber">
                  <UInput v-model="companyState.phoneNumber" type="tel" placeholder="+33 1 23 45 67 89" class="w-full" />
                </UFormField>

                <UFormField label="Adresse" name="address" class="md:col-span-2">
                  <UTextarea v-model="companyState.address" placeholder="Adresse complète" :rows="3" class="w-full" />
                </UFormField>
              </div>
            </div>
          </div>

          <!-- Section Paramètres de facturation -->
          <div class="space-y-6 mt-12">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900">Paramètres de facturation</h3>
              <p class="text-sm text-gray-500">Configurez les paramètres de paiement et d'affichage des factures</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="IBAN" name="iban">
                <UInput v-model="companyState.iban" placeholder="FR7630001007941234567890189" class="w-full" />
              </UFormField>

              <UFormField label="BIC" name="bic">
                <UInput v-model="companyState.bic" placeholder="BNPAFRPP" class="w-full" />
              </UFormField>

              <UFormField label="Note de bas de page" name="footerNote" class="md:col-span-2">
                <UTextarea v-model="companyState.footerNote" placeholder="Texte qui apparaîtra en bas de vos factures" :rows="2" class="w-full" />
              </UFormField>

              <UFormField label="Conditions générales de vente" name="cgv" class="md:col-span-2">
                <UTextarea v-model="companyState.cgv" placeholder="Vos conditions générales de vente" :rows="8" class="w-full" />
              </UFormField>
            </div>
          </div>

          <!-- Section Apparence -->
          <div class="space-y-6 mt-12">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900">Apparence</h3>
              <p class="text-sm text-gray-500">Personnalisez l'apparence de vos factures</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UPopover>
                <UFormField label="Couleur primaire" name="primaryColor" class="md:col-span-2">
                  <UButton label="Choisir une couleur" color="neutral" variant="outline" class="w-full">
                    <template #leading>
                      <span :style="{ backgroundColor: companyState.primaryColor }" class="size-3 rounded-full" />
                    </template>
                  </UButton>
                </UFormField>
                <template #content>
                  <div class="space-y-4 p-2">
                    <UColorPicker v-model="companyState.primaryColor" />
                    <UInput
                      v-model="companyState.primaryColor"
                      placeholder="#000000"
                      pattern="^#[0-9A-Fa-f]{6}$"
                      class="w-full"
                    />
                  </div>
                </template>
              </UPopover>
            </div>
          </div>

          <!-- Section TVA -->
          <div class="space-y-6 mt-12">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900">Paramètres TVA</h3>
              <p class="text-sm text-gray-500">Configurez l'affichage et le calcul de la TVA</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UFormField label="Activer la TVA" name="displayVAT" class="md:col-span-2">
                <USwitch v-model="companyState.displayVAT" />
              </UFormField>

              <UFormField 
                v-if="companyState.displayVAT"
                label="Taux de TVA (%)" 
                name="vatRate"
                class="md:col-span-2"
              >
                <UInput v-model="companyState.vatRate" type="number" min="0" max="100" step="0.1" class="w-full" />
              </UFormField>
            </div>
          </div>
        </UForm>
      </template>

      <template #license>
        <UForm ref="licenseFormRef" :schema="licenseSchema" :state="licenseState" class="space-y-6">
          <div class="space-y-6">
            <div class="flex flex-col">
              <h3 class="text-lg font-semibold text-gray-900">Licence</h3>
              <p class="text-sm text-gray-500">Entrez votre clé de licence pour activer l'application</p>
            </div>

            <UFormField label="Clé de licence" name="licenseKey">
              <UInput v-model="licenseState.licenseKey" placeholder="Entrez votre clé de licence" class="w-full" />
            </UFormField>
          </div>
        </UForm>
      </template>

      <template #features>
        <UForm ref="featuresFormRef" :schema="appSchema" :state="appState" class="space-y-6">
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
        </UForm>
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
        v-if="currentStep < 3"
        color="primary"
        @click="nextStep"
      >
        Suivant
      </UButton>
      <UButton
        size="lg"
        class="w-full flex justify-center items-center"
        v-if="currentStep === 3"
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
import { setLicenseKey } from '~/utils/license'
import LogoUploader from './LogoUploader.vue'
import type { CompanySettings, AppSettings } from '~/types/settings'

const router = useRouter()
const toast = useToast()
const { companySettings, appSettings, loadSettings } = useSettings()

const logoData = computed(() => companySettings.value?.logoData)

const companySchema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  phoneNumber: z.string().min(1, 'Le numéro de téléphone est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  vatNumber: z.string().min(1, 'Le numéro de TVA est requis'),
  vatRate: z.number().min(0).max(100).step(0.1, 'Le taux de TVA doit être entre 0 et 100'),
  displayVAT: z.boolean(),
  logoUrl: z.string().optional(),
  iban: z.string().regex(/^[A-Z]{2}[0-9A-Z]+$/, 'Format IBAN invalide'),
  bic: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Format BIC invalide'),
  footerNote: z.string().optional(),
  cgv: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide')
})

const appSchema = z.object({
  enableVente: z.boolean(),
  enableTransport: z.boolean()
})

const licenseSchema = z.object({
  licenseKey: z.string().min(1, 'La clé de licence est requise')
})

type CompanyFormSchema = z.output<typeof companySchema>
type AppFormSchema = z.output<typeof appSchema>
type LicenseFormSchema = z.output<typeof licenseSchema>

const companyState = reactive<Partial<CompanySettings>>({
  companyName: '',
  phoneNumber: '',
  address: '',
  vatNumber: '',
  vatRate: 20,
  displayVAT: false,
  logoUrl: undefined,
  iban: '',
  bic: '',
  footerNote: '',
  cgv: '',
  primaryColor: '#000000'
})

const appState = reactive<Partial<AppSettings>>({
  enableVente: true,
  enableTransport: true
})

const licenseState = reactive<Partial<LicenseFormSchema>>({
  licenseKey: undefined
})

const currentStep = ref(0)
const companyFormRef = ref()
const licenseFormRef = ref()

const steps: StepperItem[] = [
  {
    slot: 'license',
    title: 'Licence',
    description: 'Activation de la licence',
    icon: 'i-heroicons-key'
  },
  {
    slot: 'company',
    title: 'Entreprise',
    description: 'Informations de l\'entreprise',
    icon: 'i-heroicons-building-office'
  },
  {
    slot: 'features',
    title: 'Fonctionnalités',
    description: 'Ce que vous voulez activer',
    icon: 'i-heroicons-cog-6-tooth'
  },
  {
    slot: 'finish',
    title: 'Terminé',
    description: 'Configuration terminée',
    icon: 'i-heroicons-check-circle'
  }
]

const features: { name: keyof AppSettings; label: string; description: string; icon: string; color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' }[] = [
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

const updateLogoData = (data: Uint8Array) => {
  if (companySettings?.value) {
    companySettings.value.logoData = data
  }
}

const nextStep = async () => {
  let isValid = true
  console.log('currentStep', currentStep.value);
  if (currentStep.value === 0) {
    isValid = await licenseFormRef.value?.validate()
    if (isValid && licenseState.licenseKey) {
      const result = await setLicenseKey(licenseState.licenseKey)
      if (!result.valid) {
        toast.add({
          title: 'Erreur de licence',
          description: result.message,
          color: 'error'
        })
        return
      }
    }
  } else if (currentStep.value === 1) {
    console.log('companyFormRef', companyFormRef.value);
    isValid = await companyFormRef.value?.validate()
    console.log('isValid', isValid);
  }

  if (!isValid) return

  if (currentStep.value === 2) {
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

    // Sauvegarder le logo si des données sont présentes
    if (companySettings.value?.logoData) {
      await writeFile('logo.png', companySettings.value.logoData, { baseDir: BaseDirectory.AppLocalData })
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

onMounted(async () => {
  await loadSettings()
  if (companySettings?.value) {
    Object.assign(companyState, companySettings.value)
  }
})
</script> 