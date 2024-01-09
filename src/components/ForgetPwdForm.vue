<template>
  <div style="display: flex; flex-direction: column">
    <div v-if="!startJwcCheck">
      <p>请输入您的新密码</p>
      <q-input
        outlined
        v-model="password"
        label="密码"
        :type="showPwd ? 'password' : 'text'"
        :rules="[(val) => val.length || '请填写此项目']"
      >
        <template v-slot:append>
          <q-icon
            :name="showPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPwd = !showPwd"
          />
        </template>
      </q-input>
      <q-input
        outlined
        v-model="passwordConfirm"
        label="再次输入密码"
        :type="showPwdConfirm ? 'password' : 'text'"
        hint=""
        :rules="[(val) => val === password || 'inputted different password']"
      >
        <template v-slot:append>
          <q-icon
            :name="showPwdConfirm ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPwdConfirm = !showPwdConfirm"
          />
        </template>
      </q-input>
      <p>您的密码将通过md5加密的方式上传至服务器,因此除了您我们都不知道密码</p>
      <q-btn
        class="q-my-md"
        color="primary"
        label="开始重置"
        @click="resetFun"
      />
    </div>

    <div v-if="startJwcCheck">
      <p>密码输入完成，进入身份验证阶段。</p>
      <p>为了核实您的身份，需要核验财大账号。</p>
      <jwc-login
        :finish_return_stu_info="finish_return_stu_info_receive"
        :mode="2"
        :pwd="md5(password)"
      ></jwc-login>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import jwcLogin from './jwcLogin.vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';
import md5 from 'js-md5';

const $q = useQuasar();
const user = useUserStore();
const startJwcCheck = ref(false);
const stuid = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPwdConfirm = ref(true);
const showPwd = ref(true);
const stu_info = ref({});
const registering = ref(false);

function finish_return_stu_info_receive(item: any) {
  return;
}
function checkFormInputted() {
  if (!password.value.length) {
    return '请填写所有表单项目';
  }
  if (password.value !== passwordConfirm.value) {
    return '两次输入的密码不一致';
  }
  if (password.value.length < 6) {
    return '密码过短';
  }
  return false;
}
function resetFun() {
  var ckr = checkFormInputted();
  if (ckr) {
    $q.notify({
      type: 'negative',
      message: ckr,
      progress: true,
    });
    return;
  }
  startJwcCheck.value = true;
}
</script>
