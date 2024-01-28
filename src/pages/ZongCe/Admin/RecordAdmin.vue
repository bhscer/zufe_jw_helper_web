<template>
  <q-page v-if="loading || err_msg.length" class="flex flex-center">
    <q-inner-loading
      v-if="loading"
      :showing="loading"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在获取信息</p>
    </q-inner-loading>
    <error-text v-else :msg="err_msg"></error-text>
  </q-page>
  <q-page class="q-ma-md" v-else>
    <div v-if="data.type === 'mark'">
      <RecordAdminMark :dt="data"></RecordAdminMark>
    </div>
    <div v-else>
      <RecordAdminPoint :dt="data"></RecordAdminPoint>
    </div>

    <q-separator class="q-mt-lg" />
    <div class="q-ma-md">
      <div class="text-h4">审批</div>

      <q-separator class="q-my-md" />
      <div v-if="data.approvedCode === 0">
        <div class="text-h6 q-mb-sm">描述</div>
        <q-editor
          v-model="post_data.msg"
          min-height="10rem"
          :readonly="submiting"
        />

        <q-separator class="q-my-md" />
        <div class="text-h6 q-mb-sm">状态</div>
        <q-select
          dense
          class="q-my-none"
          outlined
          v-model="post_data.code"
          :options="[
            {
              key: 1,
              text: '通过',
            },
            {
              key: 2,
              text: '不通过',
            },
          ]"
          option-value="key"
          option-label="text"
          option-disable="inactive"
          map-options
          emit-value
          label="选择审批结果"
        />

        <q-separator class="q-my-md" />

        <q-btn label="提交审批" :loading="submiting" @click="submitFun()" />
      </div>
      <div v-else>
        <div>
          {{
            `当前状态为: ${
              ['待审核', '已通过', '不通过', '已取消'][data.approvedCode]
            }`
          }}
        </div>
        <div>无法修改</div>
        <div v-if="data.approvedCode !== 3">
          <div>{{ `审批人: ${data.approvedBy}` }}</div>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import ErrorText from '@/components/errorText.vue';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { Ref, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RecordAdminMark from './RecordAdminMark.vue';
import RecordAdminPoint from './RecordAdminPoint.vue';

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const data = ref({});
const loading = ref(false);
const err_msg = ref('');
const submiting = ref(false);
const post_data = ref({
  msg: '',
  code: 1,
});

function submitFunReal() {
  submiting.value = true;
  api({
    method: 'post',
    url: `/zc/admin/record/${route.params.dbid}/doApprove`,
    data: post_data.value,
  })
    .then((dt) => {
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
      getRecordDetail();
    })
    .catch((error) => {
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
function submitFun() {
  $q.dialog({
    title: '确认',
    message: `是否要将该申请审批为 ${
      post_data.value.code === 1 ? '通过' : '不通过'
    }？该操作无法撤销。`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    submitFunReal();
  });
}
function getRecordDetail() {
  loading.value = true;
  user.needRefresh = false;
  api({
    method: 'post',
    url: `/zc/admin/record/${route.params.dbid}`,
  })
    .then((dt) => {
      loading.value = false;
      data.value = dt.data;
    })
    .catch((error) => {
      console.error('Error:', error);
      loading.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify === '') err_msg_notify = '未知错误';
      err_msg.value = err_msg_notify;
    });
}

onMounted(() => {
  getRecordDetail();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getRecordDetail();
    }
  }
);
</script>
