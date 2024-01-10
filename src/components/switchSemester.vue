<template>
  <div v-if="loadingSemester">
    <q-spinner-gears size="40px" color="primary" />
    <p>正在获取学期信息</p>
  </div>
  <div v-else>
    <div v-if="err_msg.length > 0">
      <div class="text-h5">获取学期列表出现错误</div>
      <p>{{ err_msg }}</p>
    </div>
    <div v-else>
      <div style="display: flex; flex-direction: row">
        <q-select
          dense
          class="q-my-sm"
          outlined
          v-model="semesterKey"
          :options="semesterData.semesterList"
          option-value="key"
          option-label="text"
          option-disable="inactive"
          map-options
          emit-value
          label="选择学期"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import { useQuasar } from 'quasar';
import { onMounted, ref, Ref, watch } from 'vue';
import { useUserStore } from '@/stores/user';

const $q = useQuasar();
const user = useUserStore();
const loadingSemester = ref(true);
const err_msg = ref('');
const semesterKey = ref('');

interface semesterDetailInfo {
  key: string;
  text: string;
}

interface semesterDataM {
  curSemesterKey: string;
  semesterList: semesterDetailInfo[];
}
const semesterData: Ref<semesterDataM> = ref({
  curSemesterKey: '',
  semesterList: [],
});

function getSemesterInfo() {
  loadingSemester.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: '/book/semester',
  })
    .then((data) => {
      semesterData.value = data.data;
      semesterKey.value = semesterData.value.curSemesterKey;
      user.semesterKeyStatus = 2;
      loadingSemester.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      user.semesterKeyStatus = 1;
      console.error('Error:', error);
      loadingSemester.value = false;
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
      err_msg.value = err_msg_notify;
    });
}

onMounted(() => {
  getSemesterInfo();
});

watch(
  () => semesterKey.value,
  (val, preVal) => {
    user.semesterKey = val;
  }
);
</script>
