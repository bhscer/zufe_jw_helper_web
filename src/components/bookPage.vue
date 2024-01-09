<template>
  <div v-if="loadingSemester" class="q-pa-md">
    <q-inner-loading
      :showing="loadingSemester"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在获取信息</p>
    </q-inner-loading>
  </div>
  <div v-else>
    <!-- userinfo || error msg -->
    <div v-if="err_msg.length > 0">
      <div class="text-h5">获取学期列表出现错误</div>
      <p>{{ err_msg }}</p>
    </div>
    <div v-else class="q-pa-md">
      <div
        style="display: flex; flex-direction: row"
        class="q-gutter-sm q-pa-auto"
      >
        <q-select
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

        <q-btn
          class="q-my-sm"
          flat
          outline
          rounded
          color="primary"
          icon="refresh"
          @click="
            () => {
              $refs.bookInfoRef.getBookInfo();
            }
          "
        />
      </div>
      <div>
        <book-info :semester-key="semesterKey" ref="bookInfoRef"></book-info>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getCurrentInstance, onMounted, Ref, ref, watch } from 'vue';
import { api } from 'boot/axios';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useUserStore } from '../stores/user';
import JwcLogin from './jwcLogin.vue';
import BookEdit from 'components/BookProcess/bookEdit.vue';
import BookInfo from 'components/bookInfo.vue';

const props = defineProps<{
  get_stu_info: any;
  set_stu_info: any;
}>();
const user = useUserStore();
const this_route = useRoute();
const this_router = useRouter();
const $q = useQuasar();
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

const bookInfoRef = ref();
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
      loadingSemester.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
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
    if (loadingSemester.value) return;
    console.log(bookInfoRef.value);
    if (bookInfoRef.value !== undefined) {
      bookInfoRef.value.$nextTick(() => {
        bookInfoRef.value.getBookInfo();
      });
    }
  }
);
</script>
<style>
p {
  margin: 0;
  padding: 0;
}
</style>
