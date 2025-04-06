<template>
  <div class="max-w-4xl mx-auto p-6">
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

      <template #vehicle>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Informations du véhicule</h2>
          <UForm ref="vehicleFormRef" :schema="vehicleSchema" :state="state" class="space-y-4 w-full">
            <UFormField label="Marque" name="vehicle_brand">
              <UInput v-model="state.vehicle_brand" placeholder="Marque du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Modèle" name="vehicle_model">
              <UInput v-model="state.vehicle_model" placeholder="Modèle du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Numéro de châssis" name="vehicle_chassis">
              <UInput v-model="state.vehicle_chassis" placeholder="Numéro de châssis" class="w-full" />
            </UFormField>
            <UFormField label="Kilométrage" name="vehicle_mileage">
              <UInput v-model="state.vehicle_mileage" type="number" placeholder="Kilométrage" class="w-full" />
            </UFormField>
            <UFormField label="Couleur" name="vehicle_color">
              <UInput v-model="state.vehicle_color" placeholder="Couleur du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Type de véhicule" name="vehicle_type">
              <USelect
                v-model="state.vehicle_type"
                :items="vehicleTypeOptions"
                placeholder="Sélectionnez le type de véhicule"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Date de première immatriculation" name="vehicle_first_registration">
              <UInput v-model="state.vehicle_first_registration" type="date" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #price>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Prix et options</h2>
          <UForm ref="priceFormRef" :schema="priceSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
            <UFormField label="Prix du véhicule" name="vehicle_price">
              <UInput v-model="state.vehicle_price" type="number" step="0.01" class="w-full" />
            </UFormField>
            <UFormField label="Acompte reçu" name="deposit">
              <UInput v-model="state.deposit" type="number" step="0.01" placeholder="Montant de l'acompte" class="w-full" />
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
import { useFactures, type FactureVente } from '~/composables/useFactures'
import { useRouter } from 'vue-router'

const props = defineProps<{
  factureId?: string
}>()

defineShortcuts({
  'Enter': () => {
    if (currentStep.value < 2) {
      nextStep()
    }
  }
})

const { addFacture, updateFacture, getFacture } = useFactures()
const router = useRouter()

const clientSchema = z.object({
  client_name: z.string().min(1, 'Le nom du client est requis'),
  client_phone: z.string().optional(),
  client_email: z.string().optional(),
  client_address: z.string().optional(),
  client_vat: z.string().optional()
})

const vehicleSchema = z.object({
  vehicle_brand: z.string().min(1, 'La marque est requise'),
  vehicle_model: z.string().min(1, 'Le modèle est requis'),
  vehicle_chassis: z.string().min(1, 'Le numéro de châssis est requis'),
  vehicle_mileage: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le kilométrage doit être positif')),
  vehicle_color: z.string().optional(),
  vehicle_type: z.string().min(1, 'Le type de véhicule est requis'),
  vehicle_first_registration: z.string().optional()
})

const priceSchema = z.object({
  vehicle_price: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix doit être positif')),
  deposit: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le montant de l\'acompte doit être positif')),
  additional_notes: z.string().optional()
})

type ClientSchema = z.output<typeof clientSchema>
type VehicleSchema = z.output<typeof vehicleSchema>
type PriceSchema = z.output<typeof priceSchema>

const state = reactive<Partial<ClientSchema & VehicleSchema & PriceSchema>>({
  client_name: undefined,
  client_phone: undefined,
  client_email: undefined,
  client_address: undefined,
  client_vat: undefined,
  vehicle_brand: undefined,
  vehicle_model: undefined,
  vehicle_chassis: undefined,
  vehicle_mileage: 0,
  vehicle_color: undefined,
  vehicle_type: undefined,
  vehicle_first_registration: undefined,
  vehicle_price: 0,
  deposit: 0,
  additional_notes: undefined
})

const currentStep = ref(0)
const clientFormRef = ref()
const vehicleFormRef = ref()
const priceFormRef = ref()
const selectedClientId = ref<string>()
const showClientForm = ref(true)
const isEditingClient = ref(false)
const currentFactureId = ref<string>()

const steps: StepperItem[] = [
  {
    slot: 'client',
    title: 'Client',
    description: 'Informations du client',
    icon: 'i-heroicons-user'
  },
  {
    slot: 'vehicle',
    title: 'Véhicule',
    description: 'Informations du véhicule',
    icon: 'i-heroicons-truck'
  },
  {
    slot: 'price',
    title: 'Prix',
    description: 'Prix et options',
    icon: 'i-heroicons-currency-euro'
  }
]

const total = computed(() => {
  const price = Number(state.vehicle_price) || 0
  return price.toFixed(2)
})

const toast = useToast()

// Charger la facture existante si un ID est fourni
onMounted(async () => {
  if (props.factureId) {
    const facture = await getFacture(props.factureId)
    if (facture && facture.type === 'vente') {
      // Copier toutes les propriétés de la facture dans l'état
      Object.assign(state, facture)
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
    const factureData: Omit<FactureVente, 'id' | 'date_creation' | 'date_modification'> = {
      type: 'vente',
      client_id: selectedClientId.value,
      vehicle_brand: state.vehicle_brand!,
      vehicle_model: state.vehicle_model!,
      vehicle_chassis: state.vehicle_chassis!,
      vehicle_mileage: state.vehicle_mileage!,
      vehicle_color: state.vehicle_color,
      vehicle_type: state.vehicle_type!,
      vehicle_first_registration: state.vehicle_first_registration,
      vehicle_price: state.vehicle_price!,
      deposit: state.deposit,
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
        if (!isValid) return // On regarde directement ici car c'est a ce moment que le client est créé / modifié
        await clientFormRef.value?.submitForm()
      }
      break
    case 1:
      isValid = await vehicleFormRef.value?.validate()
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

const vehicleTypeOptions = ref([
  { label: 'Break', value: 'BREAK' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Berline', value: 'BERLINE' },
  { label: 'Citadine', value: 'CITADINE' },
  { label: 'Coupé', value: 'COUPÉ' },
  { label: 'Cabriolet', value: 'CABRIOLET' },
  { label: 'Autre', value: 'AUTRE' }
])
</script> 