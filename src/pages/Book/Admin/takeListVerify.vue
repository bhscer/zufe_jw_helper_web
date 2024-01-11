<template>
  <q-markup-table>
    <thead>
      <tr>
        <th class="text-left" style="width: 5%">姓名</th>
        <th class="text-left" style="width: 5%">时间</th>
        <th class="text-left" style="width: 5%">状态</th>
        <th class="text-left">书目</th>
        <th class="text-center" style="width: 10%">操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, idx) in dt" :key="idx">
        <td class="text-left">{{ item.stuName }}</td>
        <td class="text-left">{{ $TimestampToDate(item.takeTime) }}</td>
        <td class="text-left">
          <div v-if="item.approvedCode === 0">待审批</div>
          <div v-else-if="item.approvedCode === 1" class="text-green">
            已通过
          </div>
          <div v-else class="text-red">未通过</div>
        </td>
        <td class="text-left">
          {{
            `${shortTxt(item.takeList[0].bookName)}等${item.takeList.length}本`
          }}
        </td>
        <td class="text-center">
          <q-btn
            label="查看"
            flat
            outline
            rounded
            color="primary"
            @click="
              takeDeatilIdx = idx;
              showTakeDetail = true;
            "
          ></q-btn>
        </td>
      </tr>
    </tbody>
  </q-markup-table>

  <q-dialog v-model="showTakeDetail">
    <q-card class="q-pa-lg">
      <div>
        <span>姓名:</span
        ><span class="text-h6">{{ dt[takeDeatilIdx].stuName }}</span>
      </div>

      <class-and-book-table
        :need-take-list="dt[takeDeatilIdx]?.takeList"
      ></class-and-book-table>
      <q-img
        :src="`${$api_url}book/take/img/${dt[takeDeatilIdx]?.imgId}`"
        v-viewer
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            <div class="q-gutter-sm">
              <p class="text-h4">:(</p>
              <p>图片加载失败</p>
            </div>
          </div>
        </template>
      </q-img>
      <div class="q-mt-md">
        <span>提交状态:</span>
        <span class="text-h6">
          <span v-if="dt[takeDeatilIdx]?.approvedCode === 0">待审批</span>
          <span
            v-else-if="dt[takeDeatilIdx]?.approvedCode === 1"
            class="text-green"
          >
            已通过
          </span>
          <span v-else class="text-red">未通过</span>
        </span>
      </div>
      <div>
        <q-btn
          :loading="changeStatusSubmiting"
          label="清空审批状态"
          @click="changeStatus(takeDeatilIdx, 0)"
        ></q-btn>
        <q-btn
          :loading="changeStatusSubmiting"
          label="审批通过"
          @click="changeStatus(takeDeatilIdx, 1)"
        ></q-btn>
        <q-btn
          :loading="changeStatusSubmiting"
          label="审批不通过"
          @click="changeStatus(takeDeatilIdx, 2)"
        ></q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { api } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { Ref, onMounted, ref, watch } from 'vue';
import classAndBookTable from '@/components/BookProcess/classAndBookTable.vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const user = useUserStore();
const loading = ref(false);
const err_msg = ref('');
const dt: Ref<AdminTakeList[]> = ref([] as AdminTakeList[]);
const showTakeDetail = ref(false);
const takeDeatilIdx = ref(0);
const changeStatusSubmiting = ref(false);

interface BookDetailNoPrice {
  className: string;
  bookName: string;
}

interface AdminTakeList {
  stuId: string;
  stuName: string;
  takeId: string;
  imgId: string;
  takeTime: number;
  takeList: BookDetailNoPrice[];
  approvedCode: number;
}

var approvedCodeDict: { [key: number]: string } = {
  0: '未审核',
  1: '已通过',
  2: '未通过',
};
function changeStatus(takeIdx: number, status: number) {
  $q.dialog({
    title: '确认',
    message: `是否要将 ${dt.value[takeIdx].stuName} 的记录修改为 ${approvedCodeDict[status]} ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    changeStatusReal(takeIdx, status);
  });
}
function changeStatusReal(takeIdx: number, status: number) {
  changeStatusSubmiting.value = true;
  api({
    method: 'post',
    url: `/admin/book/take/${dt.value[takeIdx].takeId}/set/approvedCode/${status}`,
  })
    .then((data) => {
      dt.value[takeIdx].approvedCode = status;
      $q.notify({
        type: 'positive',
        message: '修改成功',
        progress: true,
      });
      changeStatusSubmiting.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      console.error('Error:', error);
      changeStatusSubmiting.value = false;
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
      // err_msg.value = err_msg_notify;
    });
}
function getTakeList() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/admin/book/${user.semesterKey}/${user.adminSelectClass}/takes/list`,
  })
    .then((data) => {
      dt.value = data.data.reverse();
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
  getTakeList();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getTakeList();
    }
  }
);
</script>
