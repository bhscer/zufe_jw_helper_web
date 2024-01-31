<template>
  <q-card>
    <q-tabs
      v-model="cur_tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="pwd" label="账户登录(推荐)" />
      <q-tab name="qr" label="扫码登录" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="cur_tab" animated>
      <q-tab-panel name="qr">
        <jwcLoginViaQR
          :finish_return_stu_info="finish_return_stu_info"
          :mode="mode"
          :pwd="pwd"
          :semester-key="semesterKey"
          :year-key="yearKey"
        ></jwcLoginViaQR>
      </q-tab-panel>
      <q-tab-panel name="pwd">
        <jwcLoginViaPwd
          :finish_return_stu_info="finish_return_stu_info"
          :mode="mode"
          :pwd="pwd"
          :semester-key="semesterKey"
          :year-key="yearKey"
        ></jwcLoginViaPwd>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>
<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';
import jwcLoginViaQR from '@/components/jwc/jwcLoginViaQR.vue';
import jwcLoginViaPwd from '@/components/jwc/jwcLoginViaPwd.vue';
import { axios, api } from 'boot/axios';
import { url } from 'inspector';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const props = defineProps<{
  finish_return_stu_info: any;
  mode: string;
  pwd?: string;
  semesterKey?: string;
  yearKey?: string;
}>();

const cur_tab = ref('qr');
</script>
