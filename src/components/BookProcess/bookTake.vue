<template>
  <div>
    <q-list bordered class="rounded-borders">
      <q-expansion-item
        expand-separator
        icon="checklist"
        label="可拿书目"
        default-opened
      >
        <q-card>
          <q-card-section>
            <q-checkbox label="我要领书" v-model="isSubmitMode"></q-checkbox>
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
                    <q-checkbox v-model="takeBookDict[item.bookName]" />
                  </td>
                  <td class="text-left">{{ item.className }}</td>
                  <td class="text-left">{{ item.bookName }}</td>
                </tr>
              </tbody>
            </q-markup-table>
            <div class="q-mt-md" v-if="isSubmitMode">
              <q-file
                outlined
                v-model="fileModel"
                label="上传领书照片"
                accept=".jpg, image/*"
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
                    @click="submitTake()"
                  >
                  </q-btn>
                </template>
              </q-file>
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
          <take-record-card :records="dt.tookList"></take-record-card>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import ClassAndBookTable from 'components/BookProcess/classAndBookTable.vue';
import TakeRecordCard from 'components/BookProcess/takeRecordCard.vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import ImagesQuicklyCompress from 'images-quickly-compress';
import pako from 'pako';
interface BookDetailNoPrice {
  className: string;
  bookName: string;
}
interface TakeRecord {
  takeTime: number;
  takeList: BookDetailNoPrice[];
  takePhoto: string;
  approved: boolean;
}
const fileModel = ref(null);
const isSubmitMode = ref(true);
const $q = useQuasar();
let imageCompress = new ImagesQuicklyCompress({
  mode: 'pixel', //根据像素总大小压缩
  num: 2e6, //压缩后图片的总像素都是100万（相当于1000px * 1000px的图片）
  size: '500kb', //图片大小超过500kb执行压缩
  imageType: 'image/jpeg', //jpeg压缩效果十分理想
  quality: 0.8,
});
interface BookInfo_Take {
  status: number;
  msg: string;
  curType: number;

  selectedList: BookDetailNoPrice[];
  unreadyList: BookDetailNoPrice[];
  tookList: TakeRecord[];
}

const props = defineProps<{
  dt: BookInfo_Take;
  semesterKey: string;
  refreshInfoFun: any;
}>();

interface takeSubmit {
  semesterKey: string;
  takeList: string[];
  photoBase64: string;
}
const submitData: Ref<takeSubmit> = ref({
  semesterKey: '',
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
  props.dt.tookList.forEach((takedt, idx) => {
    takedt.takeList.forEach((bookdt, idx) => {
      alreadyTakeBookNameList.push(bookdt.bookName);
    });
  });
  // 统计未到的书的书名
  props.dt.unreadyList.forEach((bookdt, idx) => {
    unreadyTakeBookNameList.push(bookdt.bookName);
  });

  props.dt.selectedList.forEach((bookdt, idx) => {
    // 未到
    if (unreadyTakeBookNameList.indexOf(bookdt.bookName) !== -1) {
      return;
    }
    // 未拿为 selectList 中且未拿的
    if (alreadyTakeBookNameList.indexOf(bookdt.bookName) === -1) {
      needTakeList.value.push(bookdt);
      takeBookDict.value[bookdt.bookName] = false;
    }
  });
}

var fileBase64 = '';
// const readCodeFromFile = async () => {
//   var promise = new Promise((reslove) => {
//     var reader = new FileReader();
//     // result 属性中将包含一个字符串以表示所读取的文件内容。
//     reader.readAsArrayBuffer(fileModel.value);
//     reader.onload = function () {
//       reslove(this.result);
//     };
//   });
//   await promise.then((res) => {
//     fileBase64 = window.btoa(String.fromCharCode(...new Uint8Array(res)));
//
//
//     // var gzipUI8A =  pako.deflate(new Uint8Array(res))
//     // fileBase64 = window.btoa(String.fromCharCode(...gzipUI8A));
//
//   });
// };

async function readAndCompress() {
  var promise = new Promise(async (reslove) => {
    await imageCompress.compressor([fileModel.value]).then((res) => {
      var blod = res[0];
      var reader = new FileReader();
      reader.readAsArrayBuffer(blod);
      reader.onload = function () {
        reslove(reader.result);
      };
    });
  });
  await promise.then((res) => {
    fileBase64 = transformUint8ArrayToBase64(new Uint8Array(res));
  });
}
function transformUint8ArrayToBase64(array) {
  var binary = '';
  for (var len = array.byteLength, i = 0; i < len; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return window.btoa(binary).replace(/=/g, '');
}

async function submitTake() {
  if (fileModel.value === null) {
    $q.notify({
      type: 'negative',
      message: '请选择图片',
      progress: true,
    });
    return;
  }
  submiting.value = true;
  fileBase64 = '';
  await readAndCompress();

  if (fileBase64.length === 0) {
    $q.notify({
      type: 'negative',
      message: '读取文件出现问题',
      progress: true,
    });
    return;
  }
  // console.log(fileBase64)

  submitData.value.takeList = [];
  for (const [key, value] of Object.entries(takeBookDict.value)) {
    if (value === false) continue;
    submitData.value.takeList.push(key);
  }
  submitData.value.semesterKey = props.semesterKey;
  submitData.value.photoBase64 = fileBase64;
  console.log(submitData.value);

  api({
    method: 'post',
    url: '/book/take',
    data: submitData.value,
  })
    .then((data) => {
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
      props.refreshInfoFun();
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
watch(
  () => props.dt,
  (val, preVal) => {
    init();
  }
);

onMounted(() => {
  init();
});
</script>