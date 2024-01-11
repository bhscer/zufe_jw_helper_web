<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal class="bg-header-auto">
      <q-toolbar class="text-primary">
        <q-toolbar-title> 教务助手 </q-toolbar-title>
        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
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
import ToolbarBtnGroup from 'components/ToolbarBtnGroup.vue';

document.querySelector('#loading-state')?.remove();
</script>
