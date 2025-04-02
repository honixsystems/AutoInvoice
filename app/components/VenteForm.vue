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
            <UFormField label="Marque" name="vehicleBrand">
              <UInput v-model="state.vehicleBrand" placeholder="Marque du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Modèle" name="vehicleModel">
              <UInput v-model="state.vehicleModel" placeholder="Modèle du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Numéro de châssis" name="vehicleChassis">
              <UInput v-model="state.vehicleChassis" placeholder="Numéro de châssis" class="w-full" />
            </UFormField>
            <UFormField label="Kilométrage" name="vehicleMileage">
              <UInput v-model="state.vehicleMileage" type="number" placeholder="Kilométrage" class="w-full" />
            </UFormField>
            <UFormField label="Couleur" name="vehicleColor">
              <UInput v-model="state.vehicleColor" placeholder="Couleur du véhicule" class="w-full" />
            </UFormField>
            <UFormField label="Type de véhicule" name="vehicleType">
              <USelect
                v-model="state.vehicleType"
                :items="vehicleTypeOptions"
                placeholder="Sélectionnez le type de véhicule"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Date de première immatriculation" name="vehicleFirstRegistration">
              <UInput v-model="state.vehicleFirstRegistration" type="date" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #price>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Prix et options</h2>
          <UForm ref="priceFormRef" :schema="priceSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
            <UFormField label="Prix du véhicule" name="vehiclePrice">
              <UInput v-model="state.vehiclePrice" type="number" step="0.01" class="w-full" />
            </UFormField>
            <UFormField label="Acompte reçu" name="deposit">
              <UInput v-model="state.deposit" type="number" step="0.01" placeholder="Montant de l'acompte" class="w-full" />
            </UFormField>
            <UFormField label="Mentions supplémentaires" name="additionalNotes">
              <UTextarea v-model="state.additionalNotes" placeholder="Mentions supplémentaires" class="w-full" />
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

    <!-- Modal de prévisualisation -->
    <UModal fullscreen v-model:open="showPreview" title="Prévisualisation de la facture" description="Prévisualisation de la facture" icon="i-heroicons-eye">
      <template #content>
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-4">Prévisualisation de la facture</h3>
        <div class="border rounded-lg p-4 overflow-y-auto max-h-[80vh]">
          <VenteInvoiceTemplate :data="state" />
        </div>
        <div class="flex justify-end mt-4 space-x-2">
          <UButton color="neutral" @click="showPreview = false">Annuler</UButton>
          <UButton color="primary" @click="downloadInvoice">Enregistrer en PDF</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { StepperItem } from '@nuxt/ui'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import { useFactures, type FactureVente } from '~/composables/useFactures'

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

const clientSchema = z.object({
  clientName: z.string().min(1, 'Le nom du client est requis'),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional(),
  clientAddress: z.string().optional(),
  clientVAT: z.string().optional()
})

const vehicleSchema = z.object({
  vehicleBrand: z.string().min(1, 'La marque est requise'),
  vehicleModel: z.string().min(1, 'Le modèle est requis'),
  vehicleChassis: z.string().min(1, 'Le numéro de châssis est requis'),
  vehicleMileage: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le kilométrage doit être positif')),
  vehicleColor: z.string().optional(),
  vehicleType: z.string().min(1, 'Le type de véhicule est requis'),
  vehicleFirstRegistration: z.string().optional()
})

const priceSchema = z.object({
  vehiclePrice: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix doit être positif')),
  deposit: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le montant de l\'acompte doit être positif')),
  additionalNotes: z.string().optional()
})

type ClientSchema = z.output<typeof clientSchema>
type VehicleSchema = z.output<typeof vehicleSchema>
type PriceSchema = z.output<typeof priceSchema>

const state = reactive<Partial<ClientSchema & VehicleSchema & PriceSchema>>({
  clientName: undefined,
  clientPhone: undefined,
  clientEmail: undefined,
  clientAddress: undefined,
  clientVAT: undefined,
  vehicleBrand: undefined,
  vehicleModel: undefined,
  vehicleChassis: undefined,
  vehicleMileage: 0,
  vehicleColor: undefined,
  vehicleType: undefined,
  vehicleFirstRegistration: undefined,
  vehiclePrice: 0,
  deposit: 0,
  additionalNotes: undefined
})

const currentStep = ref(0)
const showPreview = ref(false)
const clientFormRef = ref()
const vehicleFormRef = ref()
const priceFormRef = ref()
const selectedClientId = ref<string>()
const showClientForm = ref(true)
const isEditingClient = ref(false)

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
  const price = Number(state.vehiclePrice) || 0
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
  showPreview.value = true
}

const generateInvoice = async () => {
  try {
    const factureData: Omit<FactureVente, 'id' | 'dateCreation' | 'dateModification'> = {
      type: 'vente',
      clientId: selectedClientId.value,
      clientName: state.clientName!,
      clientPhone: state.clientPhone,
      clientEmail: state.clientEmail,
      clientAddress: state.clientAddress,
      clientVAT: state.clientVAT,
      vehicleBrand: state.vehicleBrand!,
      vehicleModel: state.vehicleModel!,
      vehicleChassis: state.vehicleChassis!,
      vehicleMileage: state.vehicleMileage!,
      vehicleColor: state.vehicleColor,
      vehicleType: state.vehicleType!,
      vehicleFirstRegistration: state.vehicleFirstRegistration,
      vehiclePrice: state.vehiclePrice!,
      deposit: state.deposit,
      additionalNotes: state.additionalNotes
    }

    if (props.factureId) {
      await updateFacture(props.factureId, factureData)
      toast.add({
        title: 'Succès',
        description: 'La facture a été mise à jour avec succès.',
        color: 'success'
      })
    } else {
      await addFacture(factureData)
      toast.add({
        title: 'Succès',
        description: 'La facture a été créée avec succès.',
        color: 'success'
      })
    }

    showPreview.value = true
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error)
    toast.add({
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la génération de la facture.',
      color: 'error'
    })
  }
}

const downloadInvoice = async () => {
  try {
    // Vérifier que toutes les données requises sont présentes
    if (!state.clientName || !state.vehicleBrand || !state.vehicleModel) {
      throw new Error('Les données du client et du véhicule sont requises')
    }

    const element = document.querySelector('.invoice-template') as HTMLElement
    if (!element) return

    const { default: html2canvas } = await import('html2canvas-pro')
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF()
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    
    // Convertir le PDF en Uint8Array
    const pdfBytes = pdf.output('arraybuffer')
    const pdfArray = new Uint8Array(pdfBytes)
    
    // Utiliser le dialogue natif de Tauri pour sauvegarder le fichier
    const filePath = await save({
      filters: [{
        name: 'PDF',
        extensions: ['pdf']
      }],
      defaultPath: `facture_vente_${state.clientName}_${state.vehicleBrand}_${state.vehicleModel}.pdf`
    })
    
    if (filePath) {
      await writeFile(filePath, pdfArray)
      showPreview.value = false
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error)
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