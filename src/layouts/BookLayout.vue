<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal class="bg-header-auto">
      <q-toolbar class="text-primary">
        <q-toolbar-title> 选书系统 </q-toolbar-title>
        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
      <q-separator />
      <q-toolbar>
        <q-space></q-space>
        <switch-semester class="q-my-sm"></switch-semester>

        <q-btn
          flat
          outline
          round
          color="primary"
          icon="refresh"
          @click="user.needRefresh = true"
        />
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-page-container>
      <router-view class="q-mt-md" />
      <div class="q-mt-md q-mb-sm" style="text-align: center">
        <p>
          Developed by Bhscer,
          <a
            href="https://github.com/bhscer/zufe_jw_helper_web"
            class="text-primary"
            style="text-decoration: none"
            >"Almost" Open Source</a
          >
        </p>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { defineComponent, onMounted, ref } from 'vue';
import ToolbarBtnGroup from 'components/ToolbarBtnGroup.vue';
import switchSemester from '@/components/switchSemester.vue';
import { useUserStore } from '@/stores/user';

const user = useUserStore();
document.querySelector('.first-loading-wrp')?.remove();
</script>
