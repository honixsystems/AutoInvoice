<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { Store } from '@tauri-apps/plugin-store'
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs'
import { useSettings } from '~/composables/useSettings'
import LogoUploader from './LogoUploader.vue'
import { computed } from 'vue'

const { companySettings, loadSettings } = useSettings()

const schema = z.object({
  companyName: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  phoneNumber: z.string().min(1, 'Le numéro de téléphone est requis'),
  address: z.string().min(1, 'L\'adresse est requise'),
  footerNote: z.string().optional(),
  cgv: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hexadécimale invalide'),
  displayVAT: z.boolean().optional(),
  vatRate: z.number().min(0).max(100).step(0.1, 'Le taux de TVA doit être entre 0 et 100'),
  vatNumber: z.string().min(1, 'Le numéro de TVA est requis'),
  logoUrl: z.string().optional(),
  iban: z.string().regex(/^[A-Z]{2}[0-9A-Z]+$/, 'Format IBAN invalide'),
  bic: z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Format BIC invalide')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  companyName: undefined,
  phoneNumber: undefined,
  address: undefined,
  footerNote: undefined,
  cgv: undefined,
  primaryColor: '#000000',
  vatRate: 20,
  vatNumber: undefined,
  logoUrl: undefined,
  displayVAT: false,
  iban: undefined,
  bic: undefined
})

watch(() => state.primaryColor, (newColor) => {
  if (newColor) {
    updatePrimaryColorCSS(newColor)
  }
})

const logoPreview = ref<string | null>(null)
const logoFile = ref<File | null>(null)

const toast = useToast()

const emit = defineEmits<{
  saving: [boolean]
}>()

const logoData = computed(() => companySettings.value?.logoData)

const updateLogoData = (data: Uint8Array) => {
  if (companySettings.value) {
    companySettings.value.logoData = data
  }
}

onMounted(async () => {
  await loadSettings()
  if (companySettings.value) {
    Object.assign(state, companySettings.value)
  }
})

function updatePrimaryColorCSS(hexColor: string) {
  document.documentElement.style.setProperty('--color-customtheme-500', hexColor)
}

// Watcher pour sauvegarder automatiquement les changements
watch(state, async (newState) => {
  try {
    emit('saving', true)
    const store = await Store.load('company-settings.json')
    await store.set('settings', newState)
    await store.save()

    // Sauvegarder le logo si un nouveau fichier a été sélectionné
    if (logoFile.value) {
      const arrayBuffer = await logoFile.value.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)
      await writeFile('logo.png', uint8Array, { baseDir: BaseDirectory.AppLocalData })
      if (companySettings.value) {
        companySettings.value.logoData = uint8Array
      }
    }
    emit('saving', false)
    await loadSettings() // Recharger les paramètres après la sauvegarde
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
      <!-- Section Identité de l'entreprise -->
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
              <UInput v-model="state.companyName" placeholder="Nom de votre entreprise" class="w-full" />
            </UFormField>

            <UFormField label="Numéro de TVA" name="vatNumber">
              <UInput v-model="state.vatNumber" placeholder="FR12345678900" class="w-full" />
            </UFormField>

            <UFormField label="Numéro de téléphone" name="phoneNumber">
              <UInput v-model="state.phoneNumber" type="tel" placeholder="+33 1 23 45 67 89" class="w-full" />
            </UFormField>

            <UFormField label="Adresse" name="address" class="md:col-span-2">
              <UTextarea v-model="state.address" placeholder="Adresse complète" :rows="3" class="w-full" />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Section Paramètres de facturation -->
      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Paramètres de facturation</h3>
          <p class="text-sm text-gray-500">Configurez les paramètres de paiement et d'affichage des factures</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="IBAN" name="iban">
            <UInput v-model="state.iban" placeholder="FR7630001007941234567890189" class="w-full" />
          </UFormField>

          <UFormField label="BIC" name="bic">
            <UInput v-model="state.bic" placeholder="BNPAFRPP" class="w-full" />
          </UFormField>

          <UFormField label="Note de bas de page" name="footerNote" class="md:col-span-2">
            <UTextarea v-model="state.footerNote" placeholder="Texte qui apparaîtra en bas de vos factures" :rows="2"
              class="w-full" />
          </UFormField>

          <UFormField label="Conditions générales de vente" name="cgv" class="md:col-span-2">
            <UTextarea v-model="state.cgv" placeholder="Vos conditions générales de vente" :rows="8"
              class="w-full" />
          </UFormField>
        </div>
      </div>

      <!-- Section Apparence -->
      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Apparence</h3>
          <p class="text-sm text-gray-500">Personnalisez l'apparence de vos factures</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UPopover>
            <UFormField label="Couleur primaire" name="primaryColor" class="md:col-span-2">
              <UButton label="Choisir une couleur" color="neutral" variant="outline" class="w-full">
                <template #leading>
                  <span :style="{ backgroundColor: state.primaryColor }" class="size-3 rounded-full" />
                </template>
              </UButton>
            </UFormField>
            <template #content>
              <div class="space-y-4 p-2">
                <UColorPicker v-model="state.primaryColor" />
                <UInput
                  v-model="state.primaryColor"
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
      <div class="space-y-6">
        <div class="flex flex-col">
          <h3 class="text-lg font-semibold text-gray-900">Paramètres TVA</h3>
          <p class="text-sm text-gray-500">Configurez l'affichage et le calcul de la TVA</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormField label="Activer la TVA" name="displayVAT" class="md:col-span-2">
            <USwitch v-model="state.displayVAT" />
          </UFormField>

          <UFormField 
            v-if="state.displayVAT"
            label="Taux de TVA (%)" 
            name="vatRate"
            class="md:col-span-2"
          >
            <UInput v-model="state.vatRate" type="number" min="0" max="100" step="0.1" class="w-full" />
          </UFormField>
        </div>
      </div>
    </div>
  </UForm>
</template>