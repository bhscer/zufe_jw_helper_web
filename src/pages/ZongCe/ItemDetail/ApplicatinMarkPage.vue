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
        <div class="text-h5">成绩申请</div>
        <div>{{ `类目: ${partName} -> ${childrenName}` }}</div>
        <div>请注意，若之前该项目已有通过的申请，将在本申请提交后自动关闭</div>
      </div>
      <div class="col-auto q-gutter-sm" align="right">
        <q-btn
          outline
          color="primary"
          label="提交"
          @click="submitAll()"
          :loading="submiting"
        ></q-btn>
        <br />
        <q-btn
          outline
          color="primary"
          label="成绩同步"
          @click="showJwcForm = true"
          size="sm"
        ></q-btn>
        <div>
          <p class="q-ma-none q-pa-none">
            {{ markUpdateTime > 0 ? `成绩上次同步时间:` : '成绩未同步' }}
          </p>
          <p v-if="markUpdateTime > 0" class="q-ma-none q-pa-none">
            {{ $TimestampToDate(markUpdateTime) }}
          </p>
        </div>
      </div>
    </div>

    <q-separator class="q-my-md" />

    <div v-if="markUpdateTime === 0">请先同步成绩</div>
    <div v-else>
      <div class="text-h6 q-mb-sm">成绩列表</div>
      <p v-if="cur_via === 'pe'">请选择两门体育课程</p>
      <p v-else>请选择除体育课外的全部课程</p>
      <p>
        若你存在不及格的课程：
        如果补考通过请仅勾选该课程的考试类型为补考xxx的选项，其他情况请仅勾选正常考试项
      </p>
      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left">选择</th>
            <th class="text-left">课程名</th>
            <th class="text-left">考试类型</th>
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
                @click="calMark()"
                v-model="classSelectedDict[item.uname ? item.uname : '']"
              />
            </td>
            <td class="text-left">{{ item.name }}</td>
            <td class="text-left">{{ item.examType }}</td>
            <td class="text-left">{{ item.semester }}</td>
            <td class="text-left">{{ item.xf }}</td>
            <td class="text-left">{{ item.cjFinal }}</td>
            <td class="text-left">{{ item.cjRaw }}</td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-separator class="q-my-md" />
      <div class="text-h6 q-mb-sm">最终分数</div>
      <div>{{ `${caledMark} 分` }}</div>

      <q-separator class="q-my-md" />
      <div class="text-h6 q-mb-sm">描述</div>
      <q-editor
        v-model="data.description"
        min-height="10rem"
        :readonly="submiting"
      />
    </div>
  </q-page>
  <q-dialog v-model="showJwcForm">
    <q-card class="q-pa-lg">
      <p>{{ '正在使用教务处获取' + user.yearKey + '学年的成绩' }}</p>
      <div>请注意，成绩同步后，之前的申请将全部标为取消</div>
      <jwc-login
        :finish_return_stu_info="
          () => {
            showJwcForm = false;
            refreshInfoFun();
          }
        "
        mode="updateMarkList"
        :yearKey="user.yearKey"
      ></jwc-login>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import errorText from '@/components/errorText.vue';
import jwcLogin from '@/components/jwcLogin.vue';
import { api } from '@/boot/axios';
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
  description: string;
}
const cur_via: Ref<string | null> = ref(null);
const partName = ref('');
const childrenName = ref('');

const data: Ref<markApply> = ref({
  yearKey: user.yearKey,
  partName: partName.value,
  childrenName: childrenName.value,
  selectClass: [],
  description: '请输入描述',
});
const err_msg = ref('');
const loading = ref(true);
const submiting = ref(false);

interface classMarkDeatil {
  uname?: string;
  name: string;
  cjFinal: number;
  cjRaw: number;
  xf: number;
  semester: string;
}
const classMarkList: Ref<classMarkDeatil[]> = ref([]);
const markUpdateTime = ref(0);
const showJwcForm = ref(false);

function getSelectedList() {
  var tmp_li: classInfo[] = [];
  classMarkList.value.forEach((el, idx) => {
    var uname = `${classMarkList.value[idx].semester}:${classMarkList.value[idx].name}`;
    if (classSelectedDict.value[uname]) {
      tmp_li.push({
        name: classMarkList.value[idx].name,
        semester: classMarkList.value[idx].semester,
      });
    }
  });
  return tmp_li;
}
function submitAll() {
  submiting.value = true;
  data.value.yearKey = user.yearKey;
  data.value.partName = partName.value;
  data.value.childrenName = childrenName.value;
  data.value.selectClass = getSelectedList();

  api({
    method: 'post',
    url: '/zc/item/application/mark/submit',
    data: data.value,
  })
    .then((dt) => {
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
      router.replace(
        encodeURI(
          `/zc/item/${partName.value}/${childrenName.value}/${dt.data.dbid}`
        )
      );
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
const caledMark = ref(0.0);

function calMark() {
  var tmp_xf = 0.0;
  var tmp_cj = 0.0;
  var tmp_cjMxf = 0.0;
  var tmp_cnt = 0;
  classMarkList.value.forEach((el, idx) => {
    var uname = `${classMarkList.value[idx].semester}:${classMarkList.value[idx].name}`;
    if (classSelectedDict.value[uname]) {
      tmp_xf += classMarkList.value[idx].xf;
      tmp_cj += classMarkList.value[idx].cjFinal;
      tmp_cjMxf +=
        classMarkList.value[idx].xf * classMarkList.value[idx].cjFinal;
      tmp_cnt++;
    }
  });
  console.log(`xf${tmp_xf}, cj${tmp_cj}, cjMxf${tmp_cjMxf}, cnt${tmp_cnt}`);
  var tmp_rs = 0;
  if (tmp_cnt !== 0) {
    if (cur_via.value === 'pe') {
      tmp_rs = tmp_cj / tmp_cnt;
    }
    if (cur_via.value === 'all') {
      tmp_rs = tmp_cjMxf / tmp_xf;
    }
  }
  caledMark.value = tmp_rs;
}
function refreshInfoFun() {
  loading.value = true;
  getUserMarkList();
}
function getCurPart() {
  var cur_path = encodeURI(decodeURI(route.fullPath));
  if (cur_path.indexOf(encodeURI('/智育/学习平均成绩/')) !== -1) {
    partName.value = '智育';
    childrenName.value = '学习平均成绩';
    return 'all';
  }
  if (cur_path.indexOf(encodeURI('/体育/体育课或体测成绩/')) !== -1) {
    partName.value = '体育';
    childrenName.value = '体育课或体测成绩';
    return 'pe';
  }
  return null;
}
const classSelectedDict: Ref<{ [key: string]: boolean }> = ref({});

function processMarkList() {
  // make sort for list
  classMarkList.value.sort((x, y) => {
    return x.name.localeCompare(y.name);
  });
  classSelectedDict.value = {};
  classMarkList.value.forEach((el, idx) => {
    var uname = `${classMarkList.value[idx].semester}:${classMarkList.value[idx].name}`;
    classMarkList.value[idx].uname = uname;
    classSelectedDict.value[uname] = cur_via.value === 'all' ? true : false;
  });
  // if (cur_via.value === 'all')
  calMark();
}
function getUserMarkList() {
  cur_via.value = getCurPart();
  if (cur_via.value === null) {
    loading.value = false;
    err_msg.value = '板块不存在';
    return;
  }
  api({
    method: 'post',
    url: `/zc/${user.yearKey}/allClassMark`,
  })
    .then((dt) => {
      markUpdateTime.value = dt.data.updateTime;
      classMarkList.value = dt.data.data;
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
  getUserMarkList();
});
</script>
