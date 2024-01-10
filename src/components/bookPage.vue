<template>
  <div v-if="user.semesterKeyStatus === 0" class="q-pa-md">
    <q-inner-loading
      :showing="user.semesterKeyStatus === 0"
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
    </div>
    <div v-else class="q-pa-md">
      <div>
        <book-info></book-info>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import BookInfo from 'components/bookInfo.vue';

const user = useUserStore();
const props = defineProps<{
  get_stu_info: any;
  set_stu_info: any;
}>();
</script>
<style>
p {
  margin: 0;
  padding: 0;
}
</style>
