<template>
  <div>
    <div v-if="loading || err_msg.length > 0">
      <div class="flex flex-center" style="min-height: 200px">
        <q-inner-loading
          v-if="err_msg.length == 0"
          :showing="loading"
          class="q-ma-sm"
          style="background-color: transparent"
        >
          <q-spinner-gears size="40px" color="primary" />
          <p>正在从教务处获取必要参数</p>
        </q-inner-loading>
        <error-text v-else :msg="err_msg"></error-text>
      </div>
    </div>
    <div v-else>
      <div>
        有时候服务器会出问题导致报错(主要是P2)，原因正在排查，若出现问题请多尝试几次
      </div>
      <div v-if="post_data.registerMode || post_data.need_pwd">
        <ul>
          <li>在密码绑定后，之后每次登录你只需输入验证码。</li>
          <li>
            账户登录模式下，由于财大服务器的特殊加密方式，我们<strong>不得不在服务器保存你的财大密码</strong>，然后加密运算后发往财大服务器。
          </li>
          <li style="text-decoration: line-through">
            或者说，浙财星球等第三方平台也是这么做的
          </li>
          <li>
            请放心，虽然该密码将明文传往服务器，但是我们使用HTTPS协议保证传输过程被加密
          </li>
          <li>
            请放心，你的密码将会以AES加密的方式存入数据库，即使数据库被入侵也无法得到你的密码
          </li>
        </ul>
      </div>
      <q-separator class="q-my-md" />
      <div class="q-gutter-sm">
        <div>
          <div v-if="post_data.registerMode">
            请输入你的财大账号，密码，验证码进行绑定
          </div>
          <div v-if="!post_data.registerMode && post_data.need_pwd">
            你没有保存过你的财大密码，请先保存密码以享受快捷登录
          </div>
        </div>
        <div>
          <div v-if="!post_data.registerMode && !post_data.need_pwd">
            <q-checkbox
              label="我的财大密码已经改了，需要输入新的密码"
              v-model="post_data.change_cas_pwd"
            />
          </div>
        </div>
        <div v-if="post_data.registerMode">
          <q-input
            outlined
            label="输入学号"
            v-model="post_data.user_id"
            class="col-auto"
          />
        </div>
        <div v-if="post_data.change_cas_pwd || post_data.registerMode">
          <q-input
            outlined
            label="输入密码"
            type="password"
            v-model="post_data.user_pwd"
            class="col-auto"
          />
        </div>
        <div class="row">
          <q-input outlined label="输入验证码" v-model="post_data.user_code" />
          <img
            class="q-ml-md"
            :src="jwc_params.code_img"
            style="height: 50px; width: 115px"
          />
          <q-btn label="刷新验证码" @click="getParams()" outline></q-btn>
        </div>

        <q-btn label="登录" @click="loginFun()" outline :loading="logining" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import errorText from '@/components/errorText.vue';
import { getCurrentInstance, onMounted, Ref, ref } from 'vue';
import QrcodeVue from 'qrcode.vue';
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
// mode0 update
const this_route = useRoute();
const this_router = useRouter();
const $q = useQuasar();
const loading = ref(false);
const err_msg = ref('');
const logining = ref(false);

interface jwcPwdLoginPost {
  cookies: string;
  execution: string;
  lt: string;
  _eventId: string;
  need_pwd: boolean;
  registerMode: boolean;
  change_cas_pwd: boolean;
  user_code: string;
  user_id?: string;
  user_pwd?: string;
}
const post_data: Ref<jwcPwdLoginPost> = ref({});
const jwc_params = ref({});

function params_init() {
  post_data.value = {
    cookies: jwc_params.value.cookies,
    execution: jwc_params.value.execution,
    lt: jwc_params.value.lt,
    _eventId: jwc_params.value._eventId,
    need_pwd: jwc_params.value.need_pwd,
    registerMode: jwc_params.value.registerMode,
    change_cas_pwd: false,
    user_code: '',
    user_id: '',
    user_pwd: '',
  };
}
function getParams() {
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: '/jwc/pwd/pre',
    data: {
      mode: props.mode,
    },
  })
    .then((data) => {
      // submiting.value = false;
      // console.log('submit Success:', data);
      jwc_params.value = data.data;
      params_init();
      loading.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      loading.value = false;
      console.log('Error:', error);
      logining.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      err_msg.value = err_msg_notify;
    });
}

function loginFun() {
  logining.value = true;

  var post_items = {
    mode: props.mode,
    pwd: props.pwd,
    semesterKey: props.semesterKey,
    yearKey: props.yearKey,
  };
  api({
    method: 'post',
    url: `/jwc/pwd/do/${props.mode}`,
    data: { ...post_items, ...post_data.value },
  })
    .then((data) => {
      // submiting.value = false;
      // console.log('submit Success:', data);
      logining.value = false;
      $q.notify({
        type: 'positive',
        message: data.data.msg,
        progress: true,
      });
      if (props.mode === 'register') {
        props.finish_return_stu_info({
          stu_id: data.data.stu_id,
          cookies: data.data.cookies_text,
        });
      } else {
        props.finish_return_stu_info({});
      }
    })
    .catch((error) => {
      // submiting.value = false;
      console.error('Error:', error);
      logining.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
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
      try {
        if (error.response.status === 400) {
          getParams();
        }
      } catch {}
    });
}

onMounted(() => {
  getParams();
});
</script>
