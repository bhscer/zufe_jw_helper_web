<template>
  <switch-semester class="q-my-sm"></switch-semester>

  <q-btn
    flat
    outline
    round
    color="primary"
    icon="refresh"
    @click="user.needRefresh = true"
  />
  <switch-theme-btn></switch-theme-btn>

  <account-btn></account-btn>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import AccountBtn from 'components/btn/AccountBtn.vue';
import SwitchThemeBtn from 'components/btn/SwitchThemeBtn.vue';
import SwitchSemester from './switchSemester.vue';
// import ToolbarAddBtn from "./btn/ToolbarAddBtn.vue";

const user = useUserStore();
let fullscreen = false;
const $q = useQuasar();

function changFullscreen() {
  if (!fullscreen) {
    $q.fullscreen
      .request()
      .then(() => {
        // success!
        fullscreen = true;
      })
      .catch((err) => {
        // oh, no!!!
      });
  } else {
    // 退出全屏模式：
    $q.fullscreen
      .exit()
      .then(() => {
        // success!
        fullscreen = false;
      })
      .catch((err) => {
        // oh, no!!!
      });
  }
}
</script>
