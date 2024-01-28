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
          <p>正在获取信息...</p>
        </q-inner-loading>
      </div>

      <div v-else>
        <div v-if="err_msg.length > 0">
          <q-card>
            <p>{{ err_msg }}</p>
          </q-card>
        </div>
        <div v-else>
          <div v-if="records.length === 0">没有记录哦~</div>
          <div v-else>
            <q-markup-table separator="cell">
              <thead>
                <tr>
                  <th class="text-left" rowspan="2">姓名</th>
                  <th class="text-left" rowspan="2">总分</th>
                  <th
                    v-for="item in table_first_head"
                    :key="item"
                    :colspan="item.col"
                    class="text-left"
                  >
                    {{ item.name }}
                  </th>
                </tr>
                <tr>
                  <th
                    v-for="item in table_second_head"
                    :key="item"
                    class="text-left"
                  >
                    {{ item }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in records" :key="item">
                  <td class="text-left">{{ item.stuName }}</td>
                  <td class="text-left">{{ item.mark }}</td>
                  <td
                    class="text-left"
                    v-for="(mark, mk_idx) in item.data"
                    :key="mk_idx"
                  >
                    {{ mark }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { api } from '@/boot/axios';
import { onMounted, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';

const route = useRoute();
const user = useUserStore();
const loading = ref(true);
const err_msg = ref('');
const $q = useQuasar();
const records = ref([]);
const data = ref({});
const table_first_head = ref([]);
const table_second_head = ref([]);

function processData() {
  records.value = [];
  table_first_head.value = [];
  table_second_head.value = [];
  var first_stu = true;

  console.log(data.value);
  data.value.forEach((stuInfo) => {
    var tmp_data = {
      stuName: stuInfo.stuName,
      mark: stuInfo.mark,
      data: [],
    };
    stuInfo.detail.forEach((partInfo) => {
      var partName = partInfo.name;
      // console.log(partName);

      if (first_stu)
        table_first_head.value.push({
          name: partName,
          col: partInfo.detail.length,
        });
      partInfo.detail.forEach((partModelInfo) => {
        var partModelName = partModelInfo.name;
        // console.log(' -> ', partModelName, partModelInfo.mark);
        if (first_stu) table_second_head.value.push(partModelName);
        tmp_data.data.push(partModelInfo.mark);
      });
    });
    records.value.push(tmp_data);
    first_stu = false;
  });
}
function getRecords() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/zc/admin/${user.yearKey}/${user.adminSelectClass}/summary`,
  })
    .then((dt) => {
      data.value = dt.data;
      processData();
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

onMounted(() => {
  getRecords();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getRecords();
    }
  }
);
</script>
