<template>
  <div class="q-gutter-md">
    <div class="text-h3">:(</div>
    <div class="text-h6">{{ msg }}</div>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>
