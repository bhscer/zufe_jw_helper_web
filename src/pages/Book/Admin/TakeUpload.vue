<template>
  <q-page
    class="flex flex-center"
    style="flex-wrap: wrap; flex-direction: column"
  >
    <div class="q-ma-md">
      <div class="row">
        <q-input class="col" label="学号" v-model="stuId" outlined />
        <q-btn label="查询" @click="doSearch" outline />
      </div>
      <q-separator class="q-my-md" />
      <div>
        <div
          v-if="noResult || loading || err_msg.length > 0"
          style="height: 100px; width: 100%"
        >
          <div v-if="noResult">请先查询</div>
          <div v-else-if="loading">加载中</div>
          <div v-else>
            <q-card
              ><p>{{ err_msg }}</p></q-card
            >
          </div>
        </div>
        <div v-else>
          <div>{{ `正在操作学生： ${dt.stuName}` }}</div>
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              icon="checklist"
              label="可拿书目"
              default-opened
            >
              <q-card>
                <q-card-section>
                  <div v-if="needTakeList.length === 0">
                    要领的书已经领完啦~
                  </div>
                  <div v-else>
                    <q-markup-table>
                      <thead>
                        <tr>
                          <th v-if="isSubmitMode"></th>
                          <th class="text-left">课程名</th>
                          <th class="text-left">书名</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in needTakeList" :key="item">
                          <td v-if="isSubmitMode">
                            <q-checkbox
                              v-model="
                                takeBookDict[
                                  `${item.className}.${item.bookName}`
                                ]
                              "
                            />
                          </td>
                          <td class="text-left">{{ item.className }}</td>
                          <td class="text-left">{{ item.bookName }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                    <div class="q-mt-md" v-if="isSubmitMode">
                      <q-btn
                        v-if="fileModel === null"
                        label="传不了图片,但我保证没问题,提交"
                        :loading="submiting"
                        @click="submitTake()"
                        outline
                      />
                      <q-file
                        outlined
                        v-model="fileModel"
                        label="上传领书照片"
                        accept=".jpg, image/*"
                        :disable="submiting"
                      >
                        <template v-slot:prepend>
                          <q-icon name="attach_file" />
                        </template>

                        <template v-slot:append>
                          <q-icon
                            v-if="fileModel !== null"
                            name="close"
                            @click.stop.prevent="fileModel = null"
                            class="cursor-pointer"
                          />
                        </template>
                        <template v-slot:after>
                          <q-btn
                            v-if="fileModel !== null"
                            round
                            dense
                            flat
                            icon="send"
                            :loading="submiting"
                            @click="submitTake()"
                          >
                          </q-btn>
                        </template>
                      </q-file>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
            <q-expansion-item expand-separator icon="list" label="未到书目">
              <q-card>
                <q-card-section>
                  <class-and-book-table
                    :need-take-list="dt.unreadyList"
                  ></class-and-book-table>
                </q-card-section>
              </q-card>
            </q-expansion-item>

            <q-expansion-item expand-separator icon="history" label="已拿记录">
              <q-card>
                <q-card-section>
                  <take-record-card
                    :records="dt.tookList"
                    :show-delete="true"
                  ></take-record-card>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import ClassAndBookTable from 'components/BookProcess/classAndBookTable.vue';
import TakeRecordCard from 'components/BookProcess/takeRecordCard.vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import ImagesQuicklyCompress from 'images-quickly-compress';
import { useUserStore } from '@/stores/user';
interface BookDetailNoPrice {
  className: string;
  bookName: string;
}
interface TakeRecord {
  takeTime: number;
  takeList: BookDetailNoPrice[];
  imgId: string;
  approved: boolean;
}
const fileModel = ref(null);
const isSubmitMode = ref(true);
const $q = useQuasar();
let imageCompress = new ImagesQuicklyCompress({
  mode: 'width', //根据固定宽度压缩
  num: 800, //压缩后所有图片的宽度都是800px
  size: 800, //图片大小超过800k压缩率比较低b执行压缩
  imageType: 'image/jpeg',
  quality: 0.8,
  orientation: false,
});
interface BookInfo_Take_Admin {
  stuName: string;
  status: number;
  msg: string;
  curType: number;

  bookList: BookDetailNoPrice[];
  unreadyList: BookDetailNoPrice[];
  tookList: TakeRecord[];
}

const props = defineProps<{
  semesterKey: string;
  refreshInfoFun: any;
}>();

const loading = ref(true);
const err_msg = ref('');

const dt: Ref<BookInfo_Take> = ref({});

interface takeSubmit {
  semesterKey: string;
  stuId: string;
  takeList: BookDetailNoPrice[];
  photoBase64: string;
}
const submitData: Ref<takeSubmit> = ref({
  semesterKey: '',
  stuId: '',
  takeList: [],
  photoBase64: '',
});

const submiting = ref(false);
const needTakeList: Ref<BookDetailNoPrice[]> = ref([]);

const takeBookDict: Ref<{ [key: string]: boolean }> = ref({});
var alreadyTakeBookNameList: string[] = [];
var unreadyTakeBookNameList: string[] = [];

function init() {
  takeBookDict.value = {};
  needTakeList.value = [];
  alreadyTakeBookNameList = [];
  unreadyTakeBookNameList = [];
  // 统计已拿的书的书名
  dt.value.tookList.forEach((takedt, idx) => {
    takedt.takeList.forEach((bookdt, idx) => {
      alreadyTakeBookNameList.push(`${bookdt.className}.${bookdt.bookName}`);
    });
  });
  // 统计未到的书的书名
  dt.value.unreadyList.forEach((bookdt, idx) => {
    unreadyTakeBookNameList.push(`${bookdt.className}.${bookdt.bookName}`);
  });

  dt.value.bookList.forEach((bookdt, idx) => {
    var fullName = `${bookdt.className}.${bookdt.bookName}`;
    // 未到
    if (unreadyTakeBookNameList.indexOf(fullName) !== -1) {
      return;
    }
    // 未拿为 selectList 中且未拿的
    if (alreadyTakeBookNameList.indexOf(fullName) === -1) {
      needTakeList.value.push(bookdt);
      takeBookDict.value[fullName] = false;
    }
  });
}

var fileBase64 = '';
var fileRaw: ArrayBuffer;

function promiseRead() {
  return new Promise(async (reslove) => {
    imageCompress.compressor([fileModel.value]).then((res) => {
      var blod = res[0];
      var reader = new FileReader();
      reader.readAsArrayBuffer(blod);
      reader.onload = function () {
        fileRaw = reader.result;
        reslove('ok');
      };
    });
  });
}
async function readAndCompress() {
  await promiseRead();
  fileBase64 = transformUint8ArrayToBase64(new Uint8Array(fileRaw));
}
function transformUint8ArrayToBase64(array) {
  var binary = '';
  for (var len = array.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary).replace(/=/g, '');
}

async function submitTake() {
  submiting.value = true;
  // if (fileModel.value === null) {
  //   $q.notify({
  //     type: 'negative',
  //     message: '请选择图片',
  //     progress: true,
  //   });
  //   submiting.value = false;
  //   return;
  // }
  fileBase64 = '';
  if (fileModel.value !== null) {
    await readAndCompress();

    if (fileBase64.length === 0) {
      $q.notify({
        type: 'negative',
        message: '读取文件出现问题',
        progress: true,
      });
      submiting.value = false;
      return;
    }
  }

  // console.log(fileBase64)

  submitData.value.takeList = [];
  needTakeList.value.forEach((bookinfo, idx) => {
    if (
      takeBookDict.value[`${bookinfo.className}.${bookinfo.bookName}`] === true
    ) {
      submitData.value.takeList.push(bookinfo);
    }
  });
  if (submitData.value.takeList.length === 0) {
    $q.notify({
      type: 'negative',
      message: '您未选书，无需提交',
      progress: true,
    });
    submiting.value = false;
    return;
  }
  submitData.value.semesterKey = user.semesterKey;
  submitData.value.photoBase64 = fileBase64;
  submitData.value.stuId = stuId.value;
  console.log(submitData.value);

  api({
    method: 'post',
    url: '/admin/book/take',
    data: submitData.value,
  })
    .then((data) => {
      submiting.value = false;
      fileModel.value = null;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
      doSearch();
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
const user = useUserStore();
const stuId = ref('220110');
const noResult = ref(true);

async function doSearch() {
  user.needRefresh = false;
  loading.value = true;
  noResult.value = false;
  err_msg.value = '';

  api({
    method: 'post',
    url: `/admin/book/take/${user.semesterKey}/${stuId.value}`,
  })
    .then((data) => {
      dt.value = data.data;
      init();
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

watch(
  () => user.needRefresh,
  () => {
    if (user.needRefresh === true) {
      user.needRefresh = false;
      if (noResult.value) return;
      doSearch();
    }
  }
);
</script>
