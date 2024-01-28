<template>
  <div v-if="loadingYear">
    <div class="text-primary">正在获取学年信息</div>
  </div>
  <div v-else>
    <div v-if="err_msg.length > 0">
      <div class="text-primary">获取学年列表出现错误</div>
      <!-- <p>{{ err_msg }}</p> -->
    </div>
    <div v-else>
      <div style="display: flex; flex-direction: row">
        <q-select
          dense
          class="q-my-none"
          outlined
          v-model="yearKey"
          :options="yearData.yearList"
          option-value="key"
          option-label="text"
          option-disable="inactive"
          map-options
          emit-value
          label="选择学年"
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
import { useRouter } from 'vue-router';

const $q = useQuasar();
const user = useUserStore();
const router = useRouter();
const loadingYear = ref(true);
const err_msg = ref('');
const yearKey = ref('');

interface yearDetailInfo {
  key: string;
  text: string;
}

interface yearDataM {
  curYearKey: string;
  yearList: yearDetailInfo[];
}
const yearData: Ref<yearDataM> = ref({
  curYearKey: '',
  yearList: [],
});

function getYearInfo() {
  loadingYear.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: '/zc/year',
  })
    .then((data) => {
      yearData.value = data.data;
      yearKey.value = yearData.value.curYearKey;
      user.yearKeyStatus = 2;
      loadingYear.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      user.yearKeyStatus = 1;
      console.error('Error:', error);
      loadingYear.value = false;
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
  getYearInfo();
});

watch(
  () => yearKey.value,
  (val, preVal) => {
    user.yearKey = val;
    // user.needRefresh = true;
    if (preVal !== '') router.push('/zc');
  }
);
</script>
