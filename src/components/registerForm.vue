<template>
  <div style="display: flex; flex-direction: column">
    <div v-if="jwc_bound">
      <q-input
        outlined
        v-model="stuid"
        label="学号"
        readonly
        :rules="[(val) => val.length || '请填写此项目']"
      />
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
        label="注册"
        @click="registerFun"
        :loading="registering"
      />
    </div>
    <div v-else>
      <p>为了核实您的身份，注册本站账号时需要核验财大账号。</p>
      <p>在您授权登陆后，我们会获取您的学号,姓名,以及该学期的课表。</p>
      <p>如果注册进程一切获取顺利，您可以前往登录页登录。</p>
      <p>
        如果你<strong>实在无法接受</strong>这种方式,请联系管理员注册账号,但是后续选书会很麻烦。
      </p>
      <jwc-login
        :finish_return_stu_info="finish_return_stu_info_receive"
        :mode="1"
      ></jwc-login>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import jwcLogin from './jwcLogin.vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';

const $q = useQuasar();
const user = useUserStore();
const jwc_bound = ref(false);
const stuid = ref('');
const password = ref('');
const passwordConfirm = ref('');
const showPwdConfirm = ref(true);
const showPwd = ref(true);
const stu_info = ref({});
const registering = ref(false);

const props = defineProps<{
  change_tab: any;
  change_stuid: any;
}>();

function finish_return_stu_info_receive(stu_info_rt: any) {
  stu_info.value = stu_info_rt;
  stuid.value = stu_info.value.stu_id;
  jwc_bound.value = true;
}
function checkFormInputted() {
  if (!(stuid.value.length && password.value.length)) {
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
function registerFun() {
  var ckr = checkFormInputted();
  if (ckr) {
    $q.notify({
      type: 'negative',
      message: ckr,
      progress: true,
    });
    return;
  }
  registering.value = true;
  user
    .register({
      stuid: stuid.value,
      pwd: password.value,
      cookies: stu_info.value.cookies,
    })
    .then(() => {
      registering.value = false;
      $q.notify({
        type: 'positive',
        message: '注册成功',
        progress: true,
      });
      props.change_stuid(stuid.value);
      props.change_tab('login');
    })
    .catch((error) => {
      registering.value = false;
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
