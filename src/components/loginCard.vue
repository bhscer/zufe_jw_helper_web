<template>
  <q-tabs
    v-model="tab"
    dense
    class="text-grey"
    active-color="primary"
    indicator-color="primary"
    align="justify"
    narrow-indicator
  >
    <q-tab name="login" label="登录" />
    <q-tab name="register" label="注册" />
  </q-tabs>

  <q-separator />

  <q-tab-panels v-model="tab" animated keep-alive>
    <q-tab-panel name="login">
      <login-form :stu_id="stuid"></login-form>
    </q-tab-panel>
    <q-tab-panel name="register">
      <register-form
        :change_tab="
          (tabNew:string) => {
            tab = tabNew;
          }
        "
        :change_stuid="
          (stuidNew:string) => {
            stuid = stuidNew;
          }
        "
      ></register-form>
    </q-tab-panel>
  </q-tab-panels>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import loginForm from './loginForm.vue';
import registerForm from './registerForm.vue';

const tab = ref('login');
const stuid = ref('');
</script>
