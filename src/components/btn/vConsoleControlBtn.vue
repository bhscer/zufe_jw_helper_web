<template>
  <q-btn round flat color="primary" @click="switchVConsoleStat">
    <q-icon>
      <BugIcon></BugIcon>
    </q-icon>
  </q-btn>
</template>

<script setup lang="ts">
import { useVCStatStore, Status } from '@/stores/vConsoleStat';
import { defineAsyncComponent } from 'vue';

const vcStatus = useVCStatStore();
const BugIcon = defineAsyncComponent(
  () => import('@/components/icons/bug_report_icon.vue')
);

function switchVConsoleStat() {
  if (vcStatus.behavior === Status.Display) {
    vcStatus.switchStat(Status.Hide);
  } else {
    vcStatus.switchStat(Status.Display);
  }
}
</script>
