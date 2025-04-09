<template>
  <canvas ref="canvas" :style="{ width: `${width}px`, height: `${height}px` }" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import bwipjs from 'bwip-js'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 30,
  },
  height: {
    type: Number,
    default: 30,
  },
})

const canvas = ref(null)

const generateCode = () => {
  if (!canvas.value) return
  try {
    bwipjs.toCanvas(canvas.value, {
      bcid:        'datamatrix',       // Type de code
      text:        props.value,        // Texte à encoder
      scale:       1,                  // Échelle
      height:      10,                 // Hauteur (non utilisé ici)
      includetext: false,              // Pas de texte sous le code
    })
  } catch (e) {
    console.error('Erreur DataMatrix:', e)
  }
}

onMounted(() => generateCode())
watch(() => props.value, () => generateCode())
</script>
