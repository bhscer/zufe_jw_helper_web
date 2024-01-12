<template>
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
      <q-stepper v-model="user_data.curType" color="primary" animated>
        <q-step
          :name="0"
          title="选书"
          icon="shopping_cart"
          :done="user_data.curType > 0"
        >
          <book-edit
            :dt="user_data"
            :refresh-info-fun="
              () => {
                getBookInfo();
              }
            "
            :semester-key="user.semesterKey"
          ></book-edit>
        </q-step>
        <q-step
          :name="1"
          title="付款"
          icon="attach_money"
          :done="user_data.curType > 1"
        >
          <book-pay :dt="user_data" :semester-key="user.semesterKey"></book-pay>
        </q-step>
        <q-step
          :name="2"
          title="取书"
          icon="forklift"
          :done="user_data.curType > 2"
        >
          <book-take
            :dt="user_data"
            :semester-key="user.semesterKey"
            :refresh-info-fun="
              () => {
                getBookInfo();
              }
            "
          ></book-take>
        </q-step>
      </q-stepper>
    </div>
  </div>
</template>

<script setup lang="ts">
import BookEdit from 'components/BookProcess/bookEdit.vue';
import { api } from 'boot/axios';
import { onMounted, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import BookPay from 'components/BookProcess/BookPay.vue';
import BookTake from 'components/BookProcess/bookTake.vue';
import { useUserStore } from '@/stores/user';

defineExpose({
  getBookInfo,
});

const user_data = ref({});
const user = useUserStore();
const loading = ref(true);
const err_msg = ref('');
const $q = useQuasar();
function getBookInfo() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/book/info/${user.semesterKey}`,
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
  getBookInfo();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getBookInfo();
    }
  }
);
</script>
