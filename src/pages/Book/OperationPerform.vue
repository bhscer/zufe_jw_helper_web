<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <div v-if="loading" class="q-pa-md">
      <q-inner-loading
        :showing="err_detail.length === 0"
        style="background-color: transparent"
      >
        <q-spinner-gears size="40px" color="primary" />
        <p>正在获取信息</p>
      </q-inner-loading>
      <div v-if="err_detail.length > 0">{{ err_detail }}</div>
    </div>
    <q-card class="q-pa-lg" v-else>
      <div v-if="op_data.operation === 'changePwd'">
        <!--修改密码-->
        <div class="text-h5">修改密码</div>
        <q-input
          outlined
          v-model="op_data.stuid"
          label="学号"
          readonly
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          v-model="password"
          label="输入新密码"
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
      </div>
      <div v-else>
        <!--无教务处注册-->
        <div class="text-h5">注册(不绑定教务处)</div>
        <q-input
          outlined
          v-model="op_data.stuid"
          label="学号"
          readonly
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          v-model="stuname"
          label="姓名"
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          v-model="classname"
          label="班级 如:22人工智能2"
          :rules="[(val) => val.length || '请填写此项目']"
        />
        <q-input
          outlined
          v-model="password"
          label="输入密码"
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
      </div>
      <q-btn
        label="提交"
        color="primary"
        @click="submit"
        :loading="submiting"
      ></q-btn>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import md5 from 'js-md5';
import { api } from '../boot/axios';
import { useQuasar } from 'quasar';
import { defineComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const $q = useQuasar();
const loading = ref(true);
const err_detail = ref('');
const stuid = ref('');
const operation = ref('');
const operation_list = ['changePwd', 'register'];
const finalToken = ref('');
const submiting = ref(false);
const router = useRouter();
const route = useRoute();
const op_data = ref({});

const password = ref('');
const showPwd = ref(true);
const stuname = ref('');
const classname = ref('');

function getOPInfo() {
  loading.value = true;
  api({
    method: 'post',
    url: '/QueryOperation',
    data: {
      id: route.query.id,
    },
  })
    .then((data) => {
      // submiting.value = false;
      // console.log('submit Success:', data);
      loading.value = false;
      // $q.notify({
      //   type: 'positive',
      //   message: '提交成功',
      //   progress: true,
      // });
      op_data.value = data.data;
    })
    .catch((error) => {
      // submiting.value = false;
      console.error('Error:', error);
      submiting.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify === '') err_msg_notify = '未知错误';
      err_detail.value = err_msg_notify;
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
    });
}
function submit() {
  submiting.value = true;
  api({
    method: 'post',
    url: '/DoOperation',
    data: {
      id: route.query.id,
      stuname: stuname.value,
      classname: classname.value,
      pwd: md5(password.value),
    },
  })
    .then((data) => {
      submiting.value = false;
      // console.log('submit Success:', data);
      $q.notify({
        type: 'positive',
        message: '执行成功',
        progress: true,
      });
      router.replace('/');
    })
    .catch((error) => {
      submiting.value = false;
      console.error('Error:', error);
      submiting.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify === '') err_msg_notify = '未知错误';
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
  getOPInfo();
});
</script>
