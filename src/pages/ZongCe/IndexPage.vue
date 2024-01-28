<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <div class="q-mx-sm">
      <div class="flex flex-center" v-if="loading">
        <q-inner-loading
          :showing="loading"
          class="q-ma-sm"
          style="background-color: transparent"
        >
          <q-spinner-gears size="40px" color="primary" />
          <p>正在获取信息</p>
        </q-inner-loading>
      </div>

      <div v-else>
        <div v-if="user_data.status === 0">
          <q-card
            ><p>{{ user_data.msg }}</p></q-card
          >
        </div>
        <div v-else-if="err_msg.length > 0">
          <q-card
            ><p>{{ err_msg }}</p></q-card
          >
        </div>
        <div v-else>
          <zong-ce-info :dt="user_data"></zong-ce-info>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { api } from 'boot/axios';
import { onMounted, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/stores/user';
import ZongCeInfo from '@/components/ZongCe/ZongCeInfo.vue';

defineExpose({
  getZCInfo,
});

const user_data = ref({});
const user = useUserStore();
const loading = ref(true);
const err_msg = ref('');
const $q = useQuasar();
function getZCInfo() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/zc/info/${user.yearKey}`,
  })
    .then((data) => {
      user_data.value = data.data;
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

onMounted(() => {
  getZCInfo();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getZCInfo();
    }
  }
);
</script>
