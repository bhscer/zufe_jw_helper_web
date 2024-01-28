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
          <div class="row">
            <div class="col">
              <div class="text-h5">{{ `已获分数:${user_data.mark}` }}</div>
              <div>
                {{
                  `类目: ${route.params.partName} -> ${route.params.childrenName}`
                }}
              </div>
            </div>
            <div class="col-auto">
              <a
                :href="
                  encodeURI(
                    `/zc/item/${route.params.partName}/${route.params.childrenName}/new`
                  )
                "
                target="_blank"
              >
                <q-badge
                  label="添加申请"
                  @click.prevent="
                    $router.push(
                      encodeURI(
                        `/zc/item/${route.params.partName}/${route.params.childrenName}/new`
                      )
                    )
                  "
                ></q-badge>
              </a>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div v-if="user_data.records.length === 0">没有记录哦~</div>
          <q-markup-table v-else>
            <thead>
              <tr>
                <th class="text-left">创建时间</th>
                <th class="text-left">简称</th>
                <th class="text-left">分数</th>
                <th class="text-left">状态</th>
                <th class="text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in user_data.records" :key="item">
                <td class="text-left">{{ $TimestampToDate(item.time) }}</td>
                <td class="text-left">{{ item.shortName }}</td>
                <td class="text-left">{{ item.mark }}</td>
                <td class="text-left">
                  {{ ['待审核', '已通过', '不通过', '已取消'][item.code] }}
                </td>
                <td>
                  <a
                    :href="`/zc/item/${route.params.partName}/${route.params.childrenName}/${item.id}`"
                    target="_blank"
                  >
                    <q-badge
                      outline
                      color="primary"
                      label="查看详情"
                      @click.prevent="
                        $router.push(
                          encodeURI(
                            `/zc/item/${route.params.partName}/${route.params.childrenName}/${item.id}`
                          )
                        )
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
  </q-page>
</template>

<script lang="ts" setup>
import { api } from 'boot/axios';
import { onMounted, Ref, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';

const route = useRoute();
const user_data = ref({});
const user = useUserStore();
const loading = ref(true);
const err_msg = ref('');
const $q = useQuasar();

function getZCSPartInfo() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/zc/${user.yearKey}/item/${route.params.partName}/${route.params.childrenName}/info`,
  })
    .then((data) => {
      user_data.value = data.data;
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
  getZCSPartInfo();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getZCSPartInfo();
    }
  }
);
</script>
