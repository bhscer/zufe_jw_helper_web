<template>
  <div v-if="user.semesterKeyStatus === 0" class="q-pa-md">
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
    <div v-if="user.semesterKeyStatus === 1">
      <div class="text-h5">获取学期列表出现错误</div>
      <p>{{ err_msg }}</p>
    </div>
    <div v-else class="q-pa-md">
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
const err_msg = ref('');
const semesterKey = ref('');

const bookInfoRef = ref();

watch(
  () => user.semesterKey,
  (val, preVal) => {
    semesterKey.value = val;
    if (user.semesterKeyStatus === 2) {
      console.log(bookInfoRef.value);
      if (bookInfoRef.value !== undefined) {
        bookInfoRef.value.$nextTick(() => {
          bookInfoRef.value.getBookInfo();
        });
      }
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
