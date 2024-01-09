<template>
  <q-form>
    <div style="display: flex; flex-direction: column">
      <p>此账号为本站账号，不是财大账号</p>
      <p>如果您未注册过,请选择注册</p>

      <q-input
        class="q-mt-md"
        outlined
        v-model="stuid"
        label="学号"
        :rules="[(val) => val.length || '请填写此项目']"
      />
      <q-input
        outlined
        v-model="password"
        label="密码"
        :type="showPwd ? 'password' : 'text'"
        hint=""
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
      <p
        class="text-primary"
        @click="showForgetPwdForm = true"
        style="cursor: pointer"
      >
        忘记密码
      </p>
      <q-btn
        class="q-my-md"
        color="primary"
        label="登录"
        @click="loginFun"
        :loading="logining"
      />
    </div>
  </q-form>
  <q-dialog v-model="showForgetPwdForm">
    <q-card class="q-pa-lg">
      <forget-pwd-form></forget-pwd-form>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';
import { watch } from 'vue';
import ForgetPwdForm from './ForgetPwdForm.vue';
import { useRoute, useRouter } from 'vue-router';

const user = useUserStore();
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const stuid = ref('');
const password = ref('');
const showPwd = ref(true);
const logining = ref(false);
const showForgetPwdForm = ref(false);

const props = defineProps<{
  stu_id: string;
}>();

watch(
  () => props.stu_id,
  () => {
    stuid.value = props.stu_id;
  }
);

function checkFormInputted() {
  if (!(stuid.value.length && password.value.length)) {
    return '请填写所有表单项目';
  }
  return false;
}
function loginFun() {
  var ckr = checkFormInputted();
  if (ckr) {
    $q.notify({
      type: 'negative',
      message: ckr,
      progress: true,
    });
    return;
  }
  logining.value = true;
  user
    .login({
      stuid: stuid.value,
      pwd: password.value,
    })
    .then(() => {
      $q.notify({
        type: 'positive',
        message: '登陆成功',
        progress: true,
      });
      logining.value = false;
      var newurl: string = route.query.from ? route.query.from.toString() : '/';
      router.replace(newurl);
    })
    .catch((error) => {
      logining.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401) {
          alert('登录失效,请重新登录');
          location.reload();
        } else if (error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
</script>
