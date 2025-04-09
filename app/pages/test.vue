<template>
  <div class="pdf-wrapper">
    <button class="print-button" @click="handlePrint">Imprimer</button>
    <button @click="navigateTo('/')">Retour</button>

    <PdfPaginator title="FACTURE DE TEST" :factureId="factureId">
      <div v-for="i in 31" :key="i">
        <h1>Hello {{ i }}</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    </PdfPaginator>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: false,
})

const factureId = '1234567890'

const handlePrint = () => {
  window.print()
}
</script>

<style scoped>
.print-button {
  margin: 20px;
  padding: 10px 20px;
  font-size: 1rem;
  background-color: #ec6714;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Cacher le bouton d'impression en mode print */
@media print {
  .print-button {
    display: none;
  }

  /* Facultatif : forcer fond blanc, suppression des ombres, etc */
  body {
    background: white !important;
    color: black;
  }

  html, body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  * {
    -webkit-print-color-adjust: exact !important; /* pour garder les couleurs */
    color-adjust: exact !important;
  }
}
</style>
