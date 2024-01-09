<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <q-card class="q-pa-lg">
      <q-input outlined v-model="stuid" label="学号" />
      <q-select v-model="operation" :options="operation_list" label="操作" />
      <q-btn
        class="q-mt-md"
        label="生成"
        @click="genOP"
        color="primary"
        :loading="submiting"
      />
      <p>{{ finalToken }}</p>
      <p>{{ finalUrl }}</p>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { api } from '../../boot/axios';
import { useQuasar } from 'quasar';
import { defineComponent, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const $q = useQuasar();
const stuid = ref('');
const operation = ref('');
const operation_list = ['changePwd', 'register'];
const finalToken = ref('');
const finalUrl = ref('');
const submiting = ref(false);
const route = useRoute();

function genOP() {
  submiting.value = true;
  api({
    method: 'post',
    url: '/admin/CreateOperation',
    data: {
      stuid: stuid.value,
      operation: operation.value,
    },
  })
    .then((data) => {
      // submiting.value = false;
      // console.log('submit Success:', data);
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });

      finalToken.value = data.data.md5Id;
      finalUrl.value = `${location.host}/OperationPerform?id=${finalToken.value}`;
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
