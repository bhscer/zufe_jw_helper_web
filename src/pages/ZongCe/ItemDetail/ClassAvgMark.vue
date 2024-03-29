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
    <div class="row">
      <div class="col">
        <div class="text-h5">加/减分申请</div>
        <div>{{ `类目: ${data.partName} -> ${data.childrenName}` }}</div>
      </div>
      <div class="col-auto">
        <q-badge
          rounded
          :color="['primary', 'green', 'red', 'black'][data.approvedCode]"
        />
        <span>{{
          ' ' + ['待审核', '已通过', '不通过', '已取消'][data.approvedCode]
        }}</span>
      </div>
    </div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">描述</div>
    <div v-html="data.description"></div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">短命名</div>
    <q-input
      outlined
      label="项目简短命名"
      v-model="data.shortdisc"
      autogrow
      readonly
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">加分量</div>
    <q-input
      outlined
      type="number"
      v-model.number="data.gainMark"
      label="加分量"
      readonly
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">证明文件</div>
    <div>
      <div v-for="(item, idx) in data.fileList" :key="item">
        <a
          :href="`${$api_url}zc/item/material/download/${user.info?.token}/${$route.params.dbid}/${item}`"
          target="_blank"
        >
          <q-icon name="download" size="sm"></q-icon>
          <span>{{ `文件${idx + 1}: ${item}` }}</span>
        </a>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import ErrorText from '@/components/errorText.vue';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { Ref, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const UUID = ref(crypto.randomUUID());
interface pointApply {
  uuid: string;
  yearKey: string;
  partName: string;
  childrenName: string;
  gainMark: number;
  shortdisc: string;
  description: string;
  fileList: string[];
  approvedCode: number; // 0wait 1ok 2rejected
  approvedText: string;
}
const data: Ref<pointApply> = ref({
  uuid: UUID.value,
  yearKey: user.yearKey,
  partName: route.params.partName,
  childrenName: route.params.childrenName,
  gainMark: 0,
  description: '请输入描述',
  fileList: [] as string[],
});
const loading = ref(false);
const err_msg = ref('');

var upload_queue: string[] = [];

function getRecordDetail() {
  loading.value = true;

  api({
    method: 'post',
    url: `/zc/${user.yearKey}/item/${route.params.partName}/${route.params.childrenName}/mark`,
  })
    .then((dt) => {
      loading.value = false;
      data.value = dt.data;
    })
    .catch((error) => {
      console.error('Error:', error);
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
</script>
