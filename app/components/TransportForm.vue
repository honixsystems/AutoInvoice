<template>
  <div class="mx-auto p-6">
    <UStepper disabled v-model="currentStep" :items="steps" class="w-full">
      <template #client>
        <div class="space-y-4 w-full">
          <ClientSelect 
            v-model="selectedClientId" 
            @edit-client="isEditingClient = true"
            @update:modelValue="(val) => { 
              selectedClientId = val;
              showClientForm = !val;
              isEditingClient = false;
            }"
          />
          <USeparator v-if="showClientForm || isEditingClient" label="OU" />
          <ClientForm 
            v-if="showClientForm || isEditingClient" 
            v-model="selectedClientId" 
            ref="clientFormRef" 
          />
        </div>
      </template>

      <template #transport>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Détails du transport</h2>
          <UForm ref="transportFormRef" :schema="transportSchema" :state="state" class="space-y-4 w-full">
            <UFormField label="Date du transport" name="transport_date">
              <UInput v-model="state.transport_date" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Lieu de départ" name="departure_location">
              <UInput v-model="state.departure_location" placeholder="Adresse de départ" class="w-full" />
            </UFormField>
            <UFormField label="Lieu d'arrivée" name="arrival_location">
              <UInput v-model="state.arrival_location" placeholder="Adresse d'arrivée" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #price>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Tarifs</h2>
          <UForm ref="priceFormRef" :schema="priceSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
            <UFormField label="Distance (km)" name="distance">
              <UInput v-model="state.distance" type="number" class="w-full" />
            </UFormField>
            <UFormField label="Prix par km" name="price_per_km">
              <UInput v-model="state.price_per_km" type="number" step="0.01" class="w-full" />
            </UFormField>
            <UFormField label="Prix de prise en charge" name="pickup_price">
              <UInput v-model="state.pickup_price" type="number" step="0.01" class="w-full" />
            </UFormField>
            <UFormField label="Mentions supplémentaires" name="additional_notes">
              <UTextarea v-model="state.additional_notes" placeholder="Mentions supplémentaires" class="w-full" />
            </UFormField>
            <div class="mt-4 p-4 rounded-lg">
              <p class="text-lg font-semibold text-primary text-right">Total: {{ total }} €</p>
            </div>
          </UForm>
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
        @click="generateInvoice"
      >
        Générer la facture
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { StepperItem } from '@nuxt/ui'
import { useFactures } from '~/composables/useFactures'
import { useSettings } from '~/composables/useSettings'
import { useRouter } from 'vue-router'

const transportSchema = z.object({
  transport_date: z.string().min(1, 'La date de transport est requise'),
  departure_location: z.string().min(1, 'Le lieu de départ est requis'),
  arrival_location: z.string().min(1, 'Le lieu d\'arrivée est requis')
})

const priceSchema = z.object({
  distance: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'La distance doit être positive')),
  price_per_km: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix par km doit être positif')),
  pickup_price: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix de prise en charge doit être positif')),
  additional_notes: z.string().optional()
})

type TransportSchema = z.output<typeof transportSchema>
type PriceSchema = z.output<typeof priceSchema>

const state = reactive<Partial<TransportSchema & PriceSchema>>({
  transport_date: undefined,
  departure_location: undefined,
  arrival_location: undefined,
  distance: 0,
  price_per_km: 1,
  pickup_price: 15,
  additional_notes: undefined
})

const currentStep = ref(0)
const clientFormRef = ref()
const transportFormRef = ref()
const priceFormRef = ref()

const steps: StepperItem[] = [
  {
    slot: 'client',
    title: 'Client',
    description: 'Informations du client',
    icon: 'i-heroicons-user'
  },
  {
    slot: 'transport',
    title: 'Transport',
    description: 'Détails du transport',
    icon: 'i-heroicons-truck'
  },
  {
    slot: 'price',
    title: 'Tarifs',
    description: 'Calcul des tarifs',
    icon: 'i-heroicons-currency-euro'
  }
]

const total = computed(() => {
  const distanceTotal = (state.distance || 0) * (state.price_per_km || 0)
  const pickupTotal = state.pickup_price || 0
  return (distanceTotal + pickupTotal).toFixed(2)
})

const toast = useToast()

const props = defineProps<{
  factureId?: string
}>()

const { addFacture, updateFacture, getFacture } = useFactures()
const { appSettings } = useSettings()

const selectedClientId = ref<string>()
const currentFactureId = ref<string>()
const showClientForm = ref(true)
const isEditingClient = ref(false)

const router = useRouter()

// Initialiser les valeurs par défaut avec les paramètres de transport
const initializeDefaults = () => {
  const transportSettings = appSettings.value?.transportSettings
  if (transportSettings) {
    state.price_per_km = transportSettings.pricePerKm || 1
    state.pickup_price = 15 // Valeur par défaut pour le pickup
    state.additional_notes = transportSettings.defaultMention || ''
  }
}

onMounted(async () => {
  // Initialiser les valeurs par défaut
  initializeDefaults()
  
  if (props.factureId) {
    const facture = await getFacture(props.factureId)
    if (facture && facture.type === 'transport') {
      console.log(facture)
      Object.assign(state, facture)
      selectedClientId.value = facture.client?.id
    }
  }
})

async function onSubmit(event: FormSubmitEvent<PriceSchema>) {
  toast.add({ 
    title: 'Succès', 
    description: 'Le formulaire a été soumis avec succès.', 
    color: 'success' 
  })
}

const generateInvoice = async () => {
  try {
    const factureData = {
      type: 'transport' as const,
      client_id: selectedClientId.value,
      transport_date: state.transport_date!,
      departure_location: state.departure_location!,
      arrival_location: state.arrival_location!,
      distance: state.distance!,
      price_per_km: state.price_per_km!,
      pickup_price: state.pickup_price!,
      additional_notes: state.additional_notes
    }

    if (props.factureId) {
      currentFactureId.value = await updateFacture(props.factureId, factureData)
      toast.add({
        title: 'Succès',
        description: 'La facture a été mise à jour avec succès.',
        color: 'success'
      })
    } else {
      currentFactureId.value = await addFacture(factureData)
      toast.add({
        title: 'Succès',
        description: 'La facture a été créée avec succès.',
        color: 'success'
      })
    }

    router.push(`/facture/${currentFactureId.value}`)
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la génération de la facture.',
      color: 'error'
    })
  }
}

const nextStep = async () => {
  let isValid = true
  
  switch (currentStep.value) {
    case 0:
      if (isEditingClient.value || showClientForm.value) {
        isValid = await clientFormRef.value?.validate()
        if (!isValid) return
        await clientFormRef.value?.submitForm()
      }
      break
    case 1:
      isValid = await transportFormRef.value?.validate()
      break
    case 2:
      isValid = await priceFormRef.value?.validate()
      break
  }

  if (!isValid) return
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}

defineShortcuts({
  'Enter': () => {
    if (currentStep.value < 2) {
      nextStep()
    }
  }
})
</script> 