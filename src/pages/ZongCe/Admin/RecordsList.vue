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
            <div class="flex">
              <div class="q-my-auto">类型筛选</div>
              <q-option-group
                v-model="codeSelection"
                :options="codeOptions"
                color="primary"
                type="checkbox"
                inline
                @update:model-value="doFilter()"
              />
            </div>

            <q-separator class="q-my-md" />
            <q-markup-table>
              <thead>
                <tr>
                  <th class="text-left">姓名</th>
                  <th class="text-left">创建时间</th>
                  <th class="text-left">大类名</th>
                  <th class="text-left">小类名</th>
                  <th class="text-left">简称</th>
                  <th class="text-left">分数</th>
                  <th class="text-left">状态</th>
                  <th class="text-left">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in recordsFiltered" :key="item">
                  <td class="text-left">{{ item.stuName }}</td>
                  <td class="text-left">{{ $TimestampToDate(item.time) }}</td>
                  <td class="text-left">{{ item.partName }}</td>
                  <td class="text-left">{{ item.childrenName }}</td>
                  <td class="text-left">{{ item.shortdisc }}</td>
                  <td class="text-left">{{ item.gainMark }}</td>
                  <td class="text-left">
                    {{
                      ['待审核', '已通过', '不通过', '已取消'][
                        item.approvedCode
                      ]
                    }}
                  </td>
                  <td>
                    <a :href="`/zc/admin/record/${item.id}`" target="_blank">
                      <q-badge
                        outline
                        color="primary"
                        label="查看详情"
                        @click.prevent="
                          $router.push(encodeURI(`/zc/admin/record/${item.id}`))
                        "
                      >
                      </q-badge>
                    </a>
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
import { api } from 'boot/axios';
import { onMounted, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';

const route = useRoute();
const records = ref([]);
const recordsFiltered = ref([]);
const user = useUserStore();
const loading = ref(true);
const err_msg = ref('');
const $q = useQuasar();
const codeSelection = ref([0, 1, 2, 3]);
const codeOptions = [
  {
    label: '待审核',
    value: 0,
  },
  {
    label: '已通过',
    value: 1,
  },
  {
    label: '未通过',
    value: 2,
  },
  {
    label: '已取消',
    value: 3,
  },
];

function doFilter() {
  loading.value = true;
  recordsFiltered.value = records.value.filter((it) => {
    return codeSelection.value.indexOf(it.approvedCode) !== -1;
  });
  loading.value = false;
}
function getRecords() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/zc/admin/${user.yearKey}/${user.adminSelectClass}/records`,
  })
    .then((data) => {
      records.value = data.data;
      doFilter();
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
