<template>
  <div class="max-w-4xl mx-auto p-6">
    <UStepper disabled v-model="currentStep" :items="steps" class="w-full" size="md">
      <template #client>
        <div class="space-y-4 w-full">
          <h2 class="text-xl font-semibold mb-4">Informations du client</h2>
          <UForm ref="clientFormRef" :schema="clientSchema" :state="state" class="space-y-4 w-full">
            <UFormField label="Nom du client" name="clientName">
              <UInput v-model="state.clientName" placeholder="Nom complet" class="w-full" />
            </UFormField>
            <UFormField label="Téléphone" name="clientPhone">
              <UInput v-model="state.clientPhone" placeholder="Numéro de téléphone" class="w-full" />
            </UFormField>
            <UFormField label="Email" name="clientEmail">
              <UInput v-model="state.clientEmail" type="email" placeholder="Adresse email" class="w-full" />
            </UFormField>
            <UFormField label="Adresse" name="clientAddress">
              <UTextarea v-model="state.clientAddress" placeholder="Adresse complète" class="w-full" />
            </UFormField>
            <UFormField label="Numéro de TVA" name="clientVAT">
              <UInput v-model="state.clientVAT" placeholder="Numéro de TVA" class="w-full" />
            </UFormField>
          </UForm>
        </div>
      </template>

      <template #transport>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold mb-4">Détails du transport</h2>
          <UForm ref="transportFormRef" :schema="transportSchema" :state="state" class="space-y-4 w-full">
            <UFormField label="Date du transport" name="transportDate">
              <UInput v-model="state.transportDate" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Lieu de départ" name="departureLocation">
              <UInput v-model="state.departureLocation" placeholder="Adresse de départ" class="w-full" />
            </UFormField>
            <UFormField label="Lieu d'arrivée" name="arrivalLocation">
              <UInput v-model="state.arrivalLocation" placeholder="Adresse d'arrivée" class="w-full" />
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
            <UFormField label="Prix par km" name="pricePerKm">
              <UInput v-model="state.pricePerKm" type="number" step="0.01" class="w-full" />
            </UFormField>
            <UFormField label="Prix de prise en charge" name="pickupPrice">
              <UInput v-model="state.pickupPrice" type="number" step="0.01" class="w-full" />
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
        variant="outline"
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
          <TransportInvoiceTemplate :data="state" />
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
import { useFactures, type FactureTransport } from '~/composables/useFactures'

const clientSchema = z.object({
  clientName: z.string().min(1, 'Le nom du client est requis'),
  clientPhone: z.string().optional(),
  clientEmail: z.string().optional(),
  clientAddress: z.string().min(1, 'L\'adresse est requise'),
  clientVAT: z.string().optional()
})

const transportSchema = z.object({
  transportDate: z.string().min(1, 'La date de transport est requise'),
  departureLocation: z.string().min(1, 'Le lieu de départ est requis'),
  arrivalLocation: z.string().min(1, 'Le lieu d\'arrivée est requis')
})

const priceSchema = z.object({
  distance: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'La distance doit être positive')),
  pricePerKm: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix par km doit être positif')),
  pickupPrice: z.number().transform((val) => Number(val)).pipe(z.number().min(0, 'Le prix de prise en charge doit être positif')),
  additionalNotes: z.string().optional()
})

type ClientSchema = z.output<typeof clientSchema>
type TransportSchema = z.output<typeof transportSchema>
type PriceSchema = z.output<typeof priceSchema>

const state = reactive<Partial<ClientSchema & TransportSchema & PriceSchema>>({
  clientName: undefined,
  clientPhone: undefined,
  clientEmail: undefined,
  clientAddress: undefined,
  clientVAT: undefined,
  transportDate: undefined,
  departureLocation: undefined,
  arrivalLocation: undefined,
  distance: 0,
  pricePerKm: 1,
  pickupPrice: 15,
  additionalNotes: undefined
})

const currentStep = ref(0)
const showPreview = ref(false)
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
  const distanceTotal = (state.distance || 0) * (state.pricePerKm || 0)
  const pickupTotal = state.pickupPrice || 0
  return (distanceTotal + pickupTotal).toFixed(2)
})

const toast = useToast()

const props = defineProps<{
  factureId?: string
}>()

const { addFacture, updateFacture, getFacture } = useFactures()

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
    const factureData: Omit<FactureTransport, 'id' | 'dateCreation' | 'dateModification'> = {
      type: 'transport',
      clientName: state.clientName!,
      clientPhone: state.clientPhone,
      clientEmail: state.clientEmail,
      clientAddress: state.clientAddress,
      clientVAT: state.clientVAT,
      transportDate: state.transportDate!,
      departureLocation: state.departureLocation!,
      arrivalLocation: state.arrivalLocation!,
      distance: state.distance!,
      pricePerKm: state.pricePerKm!,
      pickupPrice: state.pickupPrice!,
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
    if (!state.clientName || !state.transportDate) {
      throw new Error('Les données du client et de la date de transport sont requises')
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
      defaultPath: `facture_transport_${state.clientName}_${state.transportDate}.pdf`
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
      isValid = await clientFormRef.value?.validate()
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
</script> 