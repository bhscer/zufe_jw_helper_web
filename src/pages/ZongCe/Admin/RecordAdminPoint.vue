<template>
  <q-page v-if="loading || err_msg.length" class="flex flex-center">
    <q-inner-loading
      v-if="loading"
      :showing="loading"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在解析信息</p>
    </q-inner-loading>
    <error-text v-else :msg="err_msg"></error-text>
  </q-page>
  <div class="q-ma-md" v-else>
    <div class="row">
      <div class="col">
        <div class="text-h5">加/减分申请</div>
        <div>{{ `类目: ${data.partName} -> ${data.childrenName}` }}</div>
      </div>
      <div class="col-auto" align="right">
        <div>
          <q-badge
            rounded
            :color="['primary', 'green', 'red', 'black'][data.approvedCode]"
          />
          <span>{{
            ' ' + ['待审核', '已通过', '不通过', '已取消'][data.approvedCode]
          }}</span>
        </div>

        <div v-if="data.approvedCode === 1 || data.approvedCode === 2">
          <div>{{ `审批人: ${data.approvedBy}` }}</div>
        </div>
      </div>
    </div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">描述</div>
    <div v-html="data.description"></div>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">短命名</div>
    <q-input
      outlined
      label="项目简短命名"
      v-model="data.shortdisc"
      autogrow
      readonly
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">加分量</div>
    <q-input
      outlined
      type="number"
      v-model.number="data.gainMark"
      label="加分量"
      readonly
    ></q-input>

    <q-separator class="q-my-md" />
    <div class="text-h6 q-mb-sm">证明文件</div>
    <div>
      <div v-if="data.fileList.length === 0">没有提供任何文件</div>
      <div v-for="(item, idx) in data.fileList" :key="item">
        <a
          :href="`${$api_url}zc/item/material/download/${user.info?.token}/${$route.params.dbid}/${item}`"
          target="_blank"
        >
          <q-icon name="download" size="sm"></q-icon>
          <span>{{ `文件${idx + 1}: ${item}` }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { api } from '@/boot/axios';
import ErrorText from '@/components/errorText.vue';
import { useUserStore } from '@/stores/user';
import { useQuasar } from 'quasar';
import { Ref, onMounted, ref, watch } from 'vue';
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
  approvedCode: number; // 0wait 1ok 2rejected
  approvedText: string;
}
const data: Ref<pointApply> = ref({
  uuid: UUID.value,
  yearKey: user.yearKey,
  partName: route.params.partName,
  childrenName: route.params.childrenName,
  gainMark: 0,
  description: '请输入描述',
  fileList: [] as string[],
});
const loading = ref(false);
const err_msg = ref('');
const submiting = ref(false);

const props = defineProps<{
  dt: pointApply;
}>();

function initData() {
  loading.value = true;
  data.value = props.dt;
  loading.value = false;
}

watch(
  () => props.dt,
  () => {
    initData();
  }
);

onMounted(() => {
  initData();
});
</script>
