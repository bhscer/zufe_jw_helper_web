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
        <div v-if="err_msg.length > 0">
          <q-card
            ><p>{{ err_msg }}</p></q-card
          >
        </div>
        <div v-else>
          <div class="text-h4">综合测评登记表导出Word</div>
          <div>请注意，word导出目前仍是实验性功能</div>
          <div>该操作会占用服务器大量资源，请尽量减少导出次数</div>
          <q-separator class="q-my-md" />
          <div v-if="user_data.exist === true">
            <div>
              {{ `请求时间: ${$TimestampToDate(user_data.requestTime)}` }}
            </div>

            <div>
              {{
                `生成状态: ${['未生成', '已生成', '出错'][user_data.status]}`
              }}
            </div>

            <div v-if="user_data.status !== 1">
              若请求生成后5分钟内没有成功生成或生成出错，请联系管理或尝试重新生成
            </div>
            <div v-else>
              <div>
                {{ `完成时间: ${$TimestampToDate(user_data.finishedTime)}` }}
              </div>
              <a
                target="_blank"
                :href="`${$api_url}zc/${user.yearKey}/word/download/${user.info?.token}/${user.info?.stuid} ${user.info?.stuname} 综合测评登记表.docx`"
                >下载文件</a
              >
            </div>
          </div>
          <div v-else>无生成记录</div>
          <q-separator class="q-my-md" />
          <div>
            <q-btn
              label="请求生成"
              @click="submitRequest()"
              :loading="submiting"
            />
          </div>
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
import { exists } from 'fs';

const user_data = ref({});
const user = useUserStore();
const loading = ref(true);
const submiting = ref(false);
const err_msg = ref('');
const $q = useQuasar();

function getWordInfo() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/zc/${user.yearKey}/word/info`,
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

function submitRequest() {
  submiting.value = true;
  api({
    method: 'post',
    url: `/zc/${user.yearKey}/word/gen`,
  })
    .then((dt) => {
      submiting.value = false;
      getWordInfo();
      $q.notify({
        type: 'positive',
        message: '请求成功，请耐心等待1~2分钟后刷新查看',
        progress: true,
      });
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

onMounted(() => {
  getWordInfo();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getWordInfo();
    }
  }
);
</script>
