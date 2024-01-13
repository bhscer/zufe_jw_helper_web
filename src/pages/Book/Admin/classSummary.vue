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
      <q-checkbox label="更新状态" v-model="showUpdated"></q-checkbox>
      <q-checkbox label="选书状态" v-model="showSelcted"></q-checkbox>
      <q-checkbox label="付款状态" v-model="showPaid"></q-checkbox>
      <q-checkbox label="领书状态" v-model="showTook"></q-checkbox>

      <div style="display: flex; flex-wrap: wrap" class="q-ma-sm q-gutter-sm">
        <div
          v-for="(item, idx) in dt"
          :key="idx"
          style="
            border-radius: 5px;
            width: 100px;
            cursor: default;
            border-width: 3px;
            border-style: solid;
          "
          class="q-pa-sm"
          :class="
            (showUpdated && !item.updated) ||
            (showSelcted && !item.selected) ||
            (showPaid && !item.paied) ||
            (showTook && !item.took)
              ? 'negative-border'
              : 'possitive-border'
          "
        >
          <div class="text-h5">{{ item.stuName }}</div>
          <div>
            <div v-if="showUpdated">
              <span
                :class="item.updated ? 'a-dot-possitive' : 'a-dot-negative'"
              ></span>
              {{ item.updated ? '已同步' : '未同步' }}
            </div>
            <div v-if="showSelcted">
              <span
                :class="item.selected ? 'a-dot-possitive' : 'a-dot-negative'"
              ></span>
              {{ item.selected ? '已选书' : '未选书' }}
            </div>
            <div v-if="showPaid">
              <span
                :class="item.paied ? 'a-dot-possitive' : 'a-dot-negative'"
              ></span>
              {{ item.paied ? '已付款' : '未付款' }}
            </div>
            <div v-if="showTook">
              <span
                :class="item.took ? 'a-dot-possitive' : 'a-dot-negative'"
              ></span>
              {{ item.took ? '已拿书' : '未拿书' }}
            </div>
          </div>
        </div>
      </div>
      <!-- <q-markup-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 5%">姓名</th>
            <th class="text-left" style="width: 5%">更新课表</th>
            <th class="text-left" style="width: 5%">提交选书</th>
            <th class="text-left" style="width: 5%">付款完成</th>
            <th class="text-center" style="width: 10%">领书完成</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in dt" :key="idx">
            <td class="text-left">{{ item.stuName }}</td>
            <td class="text-left">{{ item.updated }}</td>
            <td class="text-left">{{ item.selected }}</td>
            <td class="text-left">{{ item.paied }}</td>
            <td class="text-left">{{ item.took }}</td>
          </tr>
        </tbody>
      </q-markup-table> -->
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
const dt: Ref<AdminBookSummary[]> = ref([] as AdminBookSummary[]);
const showUpdated = ref(true);
const showSelcted = ref(true);
const showPaid = ref(true);
const showTook = ref(true);

interface AdminBookSummary {
  stuId: string;
  stuName: string;

  updated: boolean;
  selected: boolean;
  paied: boolean;
  took: boolean;
}

function getSummary() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/admin/book/${user.semesterKey}/${user.adminSelectClass}/summary`,
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
  getSummary();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getSummary();
    }
  }
);
</script>
<style scoped lang="scss">
.a-dot-possitive {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: $primary;
  display: inline-block;
}
.a-dot-negative {
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: $red;
  display: inline-block;
}

.negative-border {
  border-color: $red;
}
.possitive-border {
  border-color: $primary;
}
</style>
