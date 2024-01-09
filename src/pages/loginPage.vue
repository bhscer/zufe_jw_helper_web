<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <q-card>
      <login-card></login-card>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import LoginCard from 'components/loginCard.vue';
</script>
