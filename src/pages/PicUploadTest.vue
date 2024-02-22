<template>
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
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import ClassAndBookTable from 'components/BookProcess/classAndBookTable.vue';
import TakeRecordCard from 'components/BookProcess/takeRecordCard.vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import ImagesQuicklyCompress from 'images-quickly-compress';
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
var submiting = ref(false);
var fileBase64 = '';
var fileRaw: ArrayBuffer;

interface takeSubmitTest {
  photoBase64: string;
}
const submitData: Ref<takeSubmitTest> = ref({
  photoBase64: '',
});

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
  if (fileModel.value === null) {
    $q.notify({
      type: 'negative',
      message: '请选择图片',
      progress: true,
    });
    submiting.value = false;
    return;
  }
  fileBase64 = '';
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
  // console.log(fileBase64)

  submitData.value.photoBase64 = fileBase64;
  console.log(submitData.value);

  api({
    method: 'post',
    url: '/book/take/test',
    data: submitData.value,
  })
    .then((data) => {
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
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
</script>
