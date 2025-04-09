<template>
  <div>
    <div v-for="(page, index) in pages" :key="index" class="pdf-page">
      <PdfHeader ref="headerRef" :title="title" />
      <div class="pdf-content">
        <div v-for="(el, i) in page" :key="i" v-html="el.outerHTML" />
      </div>
      <PdfFooter ref="footerRef" :current="index + 1" :total="pages.length" :factureId="factureId" />
    </div>

    <!-- Zone temporaire : pour mesurer le contenu réel -->
    <div ref="slotContainer" class="pdf-slot-temp">
      <slot />
    </div>

    <!-- Zone pour mesurer header/footer -->
    <div class="pdf-measure-temp">
      <PdfHeader ref="headerMeasureRef" :title="title" />
      <PdfFooter ref="footerMeasureRef" :current="1" :total="1" :factureId="factureId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { ComponentPublicInstance } from 'vue'

const PdfHeader = resolveComponent('PdfHeader')
const PdfFooter = resolveComponent('PdfFooter')

withDefaults(defineProps<{
  title: string
  factureId: string
}>(), {
  title: 'FACTURE',
  factureId: ''
})

const pages = ref<HTMLElement[][]>([])
const slotContainer = ref<HTMLElement | null>(null)

const headerMeasureRef = ref<ComponentPublicInstance | null>(null)
const footerMeasureRef = ref<ComponentPublicInstance | null>(null)

const PAGE_HEIGHT_PX = 1122 // 297mm @ 96dpi

const waitForRender = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })


const paginate = async () => {
  await nextTick()
  await waitForRender()

  const headerEl = headerMeasureRef.value?.$el as HTMLElement
  const footerEl = footerMeasureRef.value?.$el as HTMLElement

  const headerHeight = headerEl?.offsetHeight || 0
  const footerHeight = footerEl?.offsetHeight || 0
  const contentPadding = 40 * 2
  const safetyMargin = 100 // ou 10px
  const availableHeight = PAGE_HEIGHT_PX - headerHeight - footerHeight - contentPadding - safetyMargin

  const children = Array.from(slotContainer.value!.children)
  let currentPage: HTMLElement[] = []
  let remainingHeight = availableHeight

  pages.value = []

  for (const el of children) {
    const clone = el.cloneNode(true) as HTMLElement
    const elementHeight = (el as HTMLElement).offsetHeight

    if (elementHeight <= remainingHeight) {
      currentPage.push(clone)
      remainingHeight -= elementHeight
    } else {
      if (currentPage.length > 0) {
        pages.value.push([...currentPage])
        currentPage = []
        remainingHeight = availableHeight
      }

      if (elementHeight > availableHeight) {
        // Trop grand pour une page, on le force quand même
        pages.value.push([clone])
        remainingHeight = availableHeight
      } else {
        currentPage.push(clone)
        remainingHeight -= elementHeight
      }
    }
  }

  if (currentPage.length > 0) {
    pages.value.push([...currentPage])
  }

  slotContainer.value!.style.display = 'none'
}


onMounted(() => {
  paginate()
})
</script>

<style scoped>
.pdf-page {
  background-color: white;
  page-break-after: always;
  width: 210mm;
  height: 297mm;
  position: relative;
  overflow: hidden;
  padding: 40px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.pdf-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.pdf-content>* {
  break-inside: avoid;
}

.pdf-slot-temp {
  visibility: hidden;
  position: absolute;
  left: -9999px;
  top: 0;
  width: 800px;
}

.pdf-measure-temp {
  visibility: hidden;
  position: absolute;
  left: -9999px;
  top: 0;
  width: 800px;
  pointer-events: none;
}
</style>
