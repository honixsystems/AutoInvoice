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
            <UFormField label="Immatriculation" name="vehicle_plate">
              <UInput v-model="state.vehicle_plate" placeholder="Plaque d'immatriculation" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #services>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Services et réparations</h2>
          <UForm ref="servicesFormRef" :schema="servicesSchema" :state="state" class="space-y-4 w-full">
            <UFormField label="Description des travaux" name="work_description">
              <UTextarea v-model="state.work_description" placeholder="Description détaillée des travaux effectués" class="w-full" />
            </UFormField>
            <UFormField label="Prix des pièces" name="parts_price">
              <UInput v-model="state.parts_price" type="number" step="0.01" placeholder="Prix des pièces" class="w-full" />
            </UFormField>
            <UFormField label="Prix de la main d'œuvre" name="labor_price">
              <UInput v-model="state.labor_price" type="number" step="0.01" placeholder="Prix de la main d'œuvre" class="w-full" />
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
  vehicle_plate: z.string().min(1, 'La plaque d\'immatriculation est requise')
})

const servicesSchema = z.object({
  work_description: z.string().min(1, 'La description des travaux est requise'),
  parts_price: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix des pièces doit être positif')),
  labor_price: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix de la main d\'œuvre doit être positif')),
  additional_notes: z.string().optional()
})

type ClientSchema = z.output<typeof clientSchema>
type VehicleSchema = z.output<typeof vehicleSchema>
type ServicesSchema = z.output<typeof servicesSchema>

const state = reactive<Partial<ClientSchema & VehicleSchema & ServicesSchema>>({
  client_name: undefined,
  client_phone: undefined,
  client_email: undefined,
  client_address: undefined,
  client_vat: undefined,
  vehicle_brand: undefined,
  vehicle_model: undefined,
  vehicle_chassis: undefined,
  vehicle_mileage: 0,
  vehicle_plate: undefined,
  work_description: undefined,
  parts_price: 0,
  labor_price: 0,
  additional_notes: undefined
})

const currentStep = ref(0)
const clientFormRef = ref()
const vehicleFormRef = ref()
const servicesFormRef = ref()
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
    slot: 'services',
    title: 'Services',
    description: 'Services et réparations',
    icon: 'i-heroicons-wrench-screwdriver'
  }
]

const total = computed(() => {
  const parts = Number(state.parts_price) || 0
  const labor = Number(state.labor_price) || 0
  return (parts + labor).toFixed(2)
})

const toast = useToast()

// Charger la facture existante si un ID est fourni
onMounted(async () => {
  if (props.factureId) {
    const facture = await getFacture(props.factureId)
    if (facture && facture.type === 'garage') {
      Object.assign(state, facture)
      selectedClientId.value = facture.client?.id
    }
  }
})

const generateInvoice = async () => {
  try {
    const factureData = {
      type: 'garage' as const,
      client_id: selectedClientId.value,
      vehicle_brand: state.vehicle_brand!,
      vehicle_model: state.vehicle_model!,
      vehicle_chassis: state.vehicle_chassis!,
      vehicle_mileage: state.vehicle_mileage!,
      vehicle_plate: state.vehicle_plate!,
      work_description: state.work_description!,
      parts_price: state.parts_price!,
      labor_price: state.labor_price!,
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
      isValid = await vehicleFormRef.value?.validate()
      break
    case 2:
      isValid = await servicesFormRef.value?.validate()
      break
  }

  if (!isValid) return
  currentStep.value++
}

const prevStep = () => {
  currentStep.value--
}
</script>
