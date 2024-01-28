<template>
  <q-page v-if="loading || err_msg.length" class="flex flex-center">
    <q-inner-loading
      v-if="loading"
      :showing="loading"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在获取信息</p>
    </q-inner-loading>
    <error-text v-else :msg="err_msg"></error-text>
  </q-page>
  <q-page class="q-ma-md" v-else>
    <div class="row">
      <div class="col">
        <div class="text-h5">加/减分申请</div>
        <div>{{ `类目: ${data.partName} -> ${data.childrenName}` }}</div>
      </div>
      <div class="col-auto">
        <q-badge
          rounded
          :color="['primary', 'green', 'red', 'black'][data.approvedCode]"
        />
        <span>{{
          ' ' + ['待审核', '已通过', '不通过', '已取消'][data.approvedCode]
        }}</span>
      </div>
    </div>
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">选择</th>
          <th class="text-left">课程名</th>
          <th class="text-left">学期</th>
          <th class="text-left">学分</th>
          <th class="text-left">分数(系统转换后)</th>
          <th class="text-left">分数</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in classMarkList" :key="idx">
          <td class="text-left">
            <q-checkbox
              disable
              v-model="classSelectedDict[item.uname ? item.uname : '']"
            />
          </td>
          <td class="text-left">{{ item.name }}</td>
          <td class="text-left">{{ item.semester }}</td>
          <td class="text-left">{{ item.xf }}</td>
          <td class="text-left">{{ item.cjFinal }}</td>
          <td class="text-left">{{ item.cjRaw }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">最终分数</div>
    <div>{{ `${data.gainMark} 分` }}</div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">描述</div>
    <div v-html="data.description"></div>
  </q-page>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import ErrorText from '@/components/errorText.vue';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { Ref, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const UUID = ref(crypto.randomUUID());

interface classInfo {
  name: string;
  semester: string;
}
interface markApply {
  yearKey: string;
  partName: string;
  childrenName: string;
  selectClass: classInfo[];
  gainMark: number;
  shortdisc: string;
  description: string;
  approvedCode: number; // 0wait 1ok 2rejected
  approvedText: string;
}
const data: Ref<markApply> = ref({
  yearKey: user.yearKey,
  partName: route.params.partName,
  childrenName: route.params.childrenName,
  selectClass: [],
  gainMark: 0,
  description: '请输入描述',
  approvedCode: 0,
  approvedText: '',
});

const loading = ref(false);
const err_msg = ref('');

interface classMarkDeatil {
  uname?: string;
  name: string;
  cjFinal: number;
  cjRaw: number;
  xf: number;
  semester: string;
}
const classMarkList: Ref<classMarkDeatil[]> = ref([] as classMarkDeatil[]);
const classSelectedDict: Ref<{ [key: string]: boolean }> = ref({});
const selectClass: Ref<string[]> = ref([]);

function processMarkList() {
  selectClass.value = [];
  data.value.selectClass.forEach((el) => {
    var uname = `${el.semester}:${el.name}`;
    selectClass.value.push(uname);
  });
  classSelectedDict.value = {};
  classMarkList.value.forEach((el, idx) => {
    var uname = `${classMarkList.value[idx].semester}:${classMarkList.value[idx].name}`;
    classMarkList.value[idx].uname = uname;
    classSelectedDict.value[uname] =
      selectClass.value.indexOf(uname) === -1 ? false : true;
  });
}

function getRecordDetail() {
  loading.value = true;

  api({
    method: 'post',
    url: `/zc/item/record/mark/${route.params.dbid}`,
  })
    .then((dt) => {
      data.value = dt.data;
      classMarkList.value = dt.data.rawMarkList;
      processMarkList();
      loading.value = false;
    })
    .catch((error) => {
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
      if (err_msg_notify === '') err_msg_notify = '未知错误';
      err_msg.value = err_msg_notify;
    });
}

onMounted(() => {
  getRecordDetail();
});
</script>
