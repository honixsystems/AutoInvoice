<template>
  <div class="titlebar bg-white/90 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 h-10 flex items-center justify-between px-4 z-50 transform-gpu" data-tauri-drag-region="true">
    <div class="flex items-center gap-2">
      <!-- <img src="/logo.png" alt="AutoInvoice" class="w-5 h-5" /> -->
      <span class="text-sm font-medium text-gray-700 select-none">AutoInvoice</span>
    </div>
    
    <div class="flex items-center gap-1">
      <button @click="minimize" class="titlebar-button hover:bg-gray-100 p-1.5 rounded transition-colors duration-150">
        <Icon name="ph:minus" class="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button @click="maximize" class="titlebar-button hover:bg-gray-100 p-1.5 rounded transition-colors duration-150">
        <Icon name="ph:square" class="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button @click="close" class="titlebar-button hover:bg-red-500 hover:text-white p-1.5 rounded transition-colors duration-150">
        <Icon name="ph:x" class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { getCurrentWindow } from "@tauri-apps/api/window";

const window = getCurrentWindow()

const minimize = () => window.minimize()
const maximize = () => window.maximize()
const close = () => window.close()
</script>

<style scoped>
.titlebar {
  -webkit-app-region: drag;
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.titlebar-button {
  -webkit-app-region: no-drag;
}
</style> 