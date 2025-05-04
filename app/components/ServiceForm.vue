<script lang="ts" setup>
import * as z from 'zod'
import { Service } from '~/types/service'
import type { ServiceDB } from '~/types/service'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  modelValue?: string
  submitButton?: boolean
}>(), {
  submitButton: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'success'): void
}>()

const services = useServices()
const toast = useToast()

const serviceSchema: z.ZodType<Partial<ServiceDB>> = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().optional(),
  price: z.number().min(0, 'Le prix doit être positif'),
  pricing_type: z.enum(['fixed', 'hourly'])
})

const isLoading = ref(false)
const serviceFormRef = ref()

defineExpose({
  submitForm,
  validate
})

let state = reactive<Pick<ServiceDB, 'name' | 'description' | 'price' | 'pricing_type'>>({
  name: '',
  description: '',
  price: 0,
  pricing_type: 'fixed'
})

type Schema = z.output<typeof serviceSchema>

function submitForm() {
  return serviceFormRef.value?.submit()
}

function validate() {
  return serviceFormRef.value?.validate()
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (props.modelValue) {
    await updateService()
  } else {
    await addService()
  }
}

const addService = async () => {
  try {
    isLoading.value = true

    const service = new Service(state)
    const serviceId = await services.addService(service)
    emit('update:modelValue', serviceId)
    emit('success')
    toast.add({
      title: 'Service ajouté avec succès',
      description: 'Le service a été ajouté avec succès',
      color: 'success'
    })
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de l\'ajout du service',
      description: 'Une erreur est survenue lors de l\'ajout du service',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const updateService = async () => {
  try {
    isLoading.value = true

    if (!props.modelValue) {
      throw new Error('Le service n\'a pas été trouvé')
    }

    const service = new Service(state)
    await services.updateService(props.modelValue, service)
    emit('success')
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de la modification du service',
      description: 'Une erreur est survenue lors de la modification du service',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const getService = async (id: string) => {
  try {
    isLoading.value = true
    const selectedService = await services.getService(id)
    if (selectedService) {
      Object.assign(state, selectedService)
    }
  } catch (error) {
    console.error(error)
    toast.add({
      title: 'Erreur lors de la récupération du service',
      description: 'Une erreur est survenue lors de la récupération du service',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (props.modelValue) {
    await getService(props.modelValue)
  }
})

watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    await getService(newVal)
  } else {
    Object.assign(state, {
      name: '',
      description: '',
      price: 0,
      pricing_type: 'fixed',
    })
  }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <UCard>
      <template #header>
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{ modelValue ? 'Modifier le service' : 'Nouveau service' }}
        </h3>
      </template>
      <UForm ref="serviceFormRef" :schema="serviceSchema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
        <UFormField label="Nom" name="name">
          <UInput v-model="state.name" placeholder="Nom du service" class="w-full" />
        </UFormField>
        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" placeholder="Description du service" class="w-full" />
        </UFormField>
        <UFormField label="Type de tarification" name="pricing_type">
          <USelect
            v-model="state.pricing_type"
            :items="[
              { label: 'Prix fixe', value: 'fixed' },
              { label: 'Taux horaire', value: 'hourly' }
            ]"
            class="w-full"
          />
        </UFormField>
        <UFormField :label="state.pricing_type === 'fixed' ? 'Prix (€)' : 'Taux horaire (€)'" name="price">
          <UInput v-model="state.price" type="number" min="0" step="0.5" :placeholder="state.pricing_type === 'fixed' ? 'Prix du service' : 'Taux horaire'" class="w-full" />
        </UFormField>
        <div class="flex justify-end" v-if="submitButton">
          <UButton :disabled="isLoading" type="submit">
            {{ modelValue ? 'Modifier' : 'Ajouter' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template> 