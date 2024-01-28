<template>
  <q-page class="q-ma-md">
    <div class="row">
      <div class="col">
        <div class="text-h5">新增加/减分申请</div>
        <div>{{ `类目: ${data.partName} -> ${data.childrenName}` }}</div>
      </div>
      <div class="col-auto">
        <q-btn
          outline
          color="primary"
          label="提交"
          @click="submitAll()"
          :loading="submiting"
        ></q-btn>
      </div>
    </div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">描述</div>
    <q-editor
      v-model="data.description"
      min-height="10rem"
      :readonly="submiting"
    />

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">短命名</div>
    <p class="q-my-sm">申请提交后，我们将用该短命名代指该项目</p>
    <p>
      {{ '请尽量简练概括，且不能包括 \\ / : * ? " < > | 9个特殊字符' }}
    </p>
    <q-input
      outlined
      label="项目简短命名"
      v-model="data.shortdisc"
      autogrow
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">加分量</div>
    <q-input
      outlined
      type="number"
      v-model.number="data.gainMark"
      label="加分量"
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">该申请的最终命名将为:</div>
    <div>{{ `${data.shortdisc} -> ${data.gainMark}分` }}</div>
    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">证明文件</div>
    <p>目前暂不支持同个申请中同时上传不同文件夹中同名的文件，请妥善命名</p>
    <q-uploader
      :url="`${$api_url}zc/${user.yearKey}/item/${data.partName}/${data.childrenName}/material/upload/${UUID}`"
      :headers="[
        {
          name: 'Authorization',
          value: user.info?.token ? user.info?.token : '',
        },
      ]"
      label="请上传相关证明(总大小不超15MB)"
      multiple
      style="max-width: 300px"
      field-name="file"
      @uploaded="uploaded_report"
      @removed="remove_report"
      @added="add_report"
      ref="uploader"
      :readonly="submiting"
      :max-total-size="1024 * 1024 * 15"
      @rejected="onRejected"
    />
  </q-page>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { Ref, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const user = useUserStore();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

const UUID = ref(crypto.randomUUID());
interface pointApply {
  uuid: string;
  yearKey: string;
  partName: string;
  childrenName: string;
  gainMark: number;
  shortdisc: string;
  description: string;
  fileList: string[];
}
const data: Ref<pointApply> = ref({
  uuid: UUID.value,
  yearKey: user.yearKey,
  partName: route.params.partName,
  childrenName: route.params.childrenName,
  gainMark: 0,
  shortdisc: '短命名',
  description: '请输入描述',
  fileList: [] as string[],
});
const submiting = ref(false);

var upload_queue: string[] = [];
function onRejected(rejectedEntries) {
  $q.notify({
    type: 'negative',
    message: '文件总大小超出限制，添加失败',
  });
}
function submitAll() {
  if (upload_queue.length) {
    $q.notify({
      type: 'negative',
      message: '文件未全部上传，请等待上传完成或手动移除',
      progress: true,
    });
    return;
  }

  var illegalChars = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
  illegalChars.forEach((el) => {
    if (data.value.shortdisc.indexOf(el) !== -1) {
      $q.notify({
        type: 'negative',
        message: '短命名中存在不合法字符，请修改',
        progress: true,
      });
      return;
    }
  });

  data.value.uuid = UUID.value;
  data.value.yearKey = user.yearKey;
  data.value.partName = route.params.partName;
  data.value.childrenName = route.params.childrenName;
  submiting.value = true;

  api({
    method: 'post',
    url: '/zc/item/application/point/submit',
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
          `/zc/item/${data.value.partName}/${data.value.childrenName}/${dt.data.dbid}`
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
function post_remove(fileList: string[]) {
  api({
    method: 'post',
    url: `/zc/${user.yearKey}/item/${data.value.partName}/${data.value.childrenName}/material/upload/${UUID.value}/remove`,
    data: fileList,
  }).catch((error) => {
    console.error('Error:', error);
    $q.notify({
      type: 'negative',
      message: '文件删除汇报失败',
      progress: true,
    });
  });
}

function remove_report(files: readonly any[]) {
  console.log(files);
  var removed_list: string[] = [];
  files.forEach((el) => {
    if (data.value.fileList.indexOf(el.name) !== -1) {
      removed_list.push(el.name);
      data.value.fileList = data.value.fileList.filter((pbf) => {
        return pbf !== el.name;
      });
    }

    upload_queue = upload_queue.filter((pdf) => {
      return pdf != el.name;
    });
  });
  console.log(removed_list);
  if (removed_list.length > 0) {
    post_remove(removed_list);
  }
}
function uploaded_report(info: { files: readonly any[]; xhr: any }) {
  console.log(info);
  info.files.forEach((element) => {
    data.value.fileList.push(element.name);
    upload_queue = upload_queue.filter((pdf) => {
      return pdf != element.name;
    });
  });
}

function add_report(files: readonly any[]) {
  console.log(files);
  files.forEach((el) => {
    upload_queue.push(el.name);
  });
}
</script>
