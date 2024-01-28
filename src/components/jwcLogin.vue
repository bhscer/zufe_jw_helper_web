<template>
  <div>
    <p>
      使用绑定【浙财彩微】的微信号扫描二维码登录，或者点击复制链接到微信打开。
    </p>
    <p>扫描/打开链接并授权登陆后，请点击下方按钮继续</p>
    <p>解析需要一定时间，请耐心等待</p>
    <div style="display: flex; flex-direction: column" class="q-gutter-md">
      <qrcode-vue v-if="!overdue" :value="qr_text" :size="160"></qrcode-vue>
      <q-btn
        v-if="!overdue"
        class="q-mt-none"
        label="复制链接"
        @click="copy_text(qr_text)"
        style="width: 160px"
      />
      <q-btn
        v-if="!overdue || logining"
        label="验证"
        style="width: fit-content"
        color="primary"
        :loading="logining"
        @click="loginFun"
      />
    </div>
    <div v-if="overdue && !logining">
      <p class="q-mt-lg">二维码已过期</p>
      <q-btn label="重新生成" @click="genQR" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from 'vue';
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
const overdue = ref(true);
const qr_text = ref('');
const logining = ref(false);
let uuid = '';
let qr_timer: NodeJS.Timeout | null = null;

function copy_text(text: string) {
  try {
    var input = document.createElement('input'); // js创建一个input输入框
    input.value = text; // 将需要复制的文本赋值到创建的input输入框中
    document.body.appendChild(input); // 将输入框暂时创建到实例里面
    input.select(); // 选中输入框中的内容
    document.execCommand('Copy'); // 执行复制操作
    document.body.removeChild(input); // 最后删除实例中临时创建的input输入框，完成复制操作

    $q.notify({
      type: 'positive',
      message: '复制成功',
      progress: true,
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: '复制失败',
      progress: true,
    });
  }
}
function gen_uuid() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

function genQR() {
  if (qr_timer !== null) clearInterval(qr_timer);
  uuid = gen_uuid();
  qr_text.value = `https://jwcas.zufe.edu.cn/cas/qyQrLogin?uuid=${uuid}&service=http://jwxt2.zufe.edu.cn/sso/driotlogin`;
  overdue.value = false;
  qr_timer = setInterval(qrOverdueFun, 120 * 1000);
}
function qrOverdueFun() {
  overdue.value = true;
  qr_text.value = '';
}

function loginFun() {
  logining.value = true;
  api({
    method: 'post',
    url: `/jwc/checkQR/${props.mode}`,
    data: {
      uuid: uuid,
      mode: props.mode,
      pwd: props.pwd,
      semesterKey: props.semesterKey,
      yearKey: props.yearKey,
    },
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
    });
}

onMounted(() => {
  genQR();
});
</script>
