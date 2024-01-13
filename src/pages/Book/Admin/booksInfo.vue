<template>
  <q-page class="flex flex-center" v-if="loading">
    <q-inner-loading
      :showing="loading"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在获取信息</p>
    </q-inner-loading>
  </q-page>
  <div v-else>
    <q-page v-if="err_msg.length" class="flex flex-center">
      <error-text :msg="err_msg"></error-text>
    </q-page>
    <q-page v-if="dt.length === 0" class="flex flex-center">
      <error-text msg="没有记录哦~"></error-text>
    </q-page>

    <div v-else>
      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 5%">课程</th>
            <th class="text-left" style="width: 5%">书名</th>
            <th class="text-left" style="width: 5%">订书数目 男</th>
            <th class="text-left" style="width: 5%">订书数目 女</th>
            <th class="text-left" style="width: 10%">订书数目 总</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in dt" :key="idx">
            <td class="text-left">{{ item.className }}</td>
            <td class="text-left">{{ item.bookName }}</td>
            <td class="text-left">{{ item.cntMale }}</td>
            <td class="text-left">{{ item.cntFemale }}</td>
            <td class="text-left">{{ item.cntMale + item.cntFemale }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { api } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { Ref, onMounted, ref, watch } from 'vue';
import classAndBookTable from '@/components/BookProcess/classAndBookTable.vue';
import { useQuasar } from 'quasar';
import ErrorText from '@/components/errorText.vue';

const $q = useQuasar();
const user = useUserStore();
const loading = ref(false);
const err_msg = ref('');
const dt: Ref<AdminBooksInfo[]> = ref([] as AdminBooksInfo[]);
const showUpdated = ref(true);
const showSelcted = ref(true);
const showPaid = ref(true);
const showTook = ref(true);

interface AdminBooksInfo {
  className: string;
  bookName: string;
  cntMale: number;
  cntFemale: number;
}

function getBooksInfo() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/admin/book/${user.semesterKey}/${user.adminSelectClass}/books/info`,
  })
    .then((data) => {
      dt.value = data.data;
      loading.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
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
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
      err_msg.value = err_msg_notify;
    });
}
function shortTxt(txt: string) {
  if (txt.length <= 12) return txt;
  return txt.substring(0, 6) + '...' + txt.substring(txt.length - 6);
}
onMounted(() => {
  getBooksInfo();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getBooksInfo();
    }
  }
);
</script>
