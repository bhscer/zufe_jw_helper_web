<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <q-card class="q-pa-lg">
      <h2>欢迎</h2>
      <p>一些小工具</p>
      <q-btn
        class="q-mt-md"
        label="进入选书系统"
        @click="$router.push('/book')"
        color="primary"
      >
      </q-btn>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { defineComponent, ref, watch } from 'vue';
const $q = useQuasar();
const pwd = ref('');
const pwdMd5 = ref(md5(''));
</script>
