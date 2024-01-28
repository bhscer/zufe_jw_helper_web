<template>
  <q-layout view="hHh Lpr lFf">
    <q-header reveal class="bg-header-auto">
      <q-toolbar class="text-primary">
        <q-btn
          flat
          dense
          round
          icon="home"
          aria-label="home"
          @click="$router.push('/')"
        />
        <q-toolbar-title> 综测系统 </q-toolbar-title>
        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
      <q-separator />
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          color="primary"
        />
        <q-select
          v-if="isZCAdmin"
          dense
          class="q-my-none q-ml-sm"
          outlined
          v-model="selectedLink"
          :options="adminFuncList"
          option-value="link"
          option-label="title"
          option-disable="inactive"
          map-options
          emit-value
          label="管理选项"
        />
        <q-space></q-space>

        <q-select
          v-if="isZCAdmin && $route.fullPath.indexOf('admin') !== -1"
          dense
          class="q-my-none"
          outlined
          v-model="user.adminSelectClass"
          :options="user.info?.adminDict['zongce']"
          option-value="key"
          option-label="text"
          option-disable="inactive"
          map-options
          emit-value
          label="选择班级"
          @click="user.needRefresh = true"
        />

        <switch-year class="q-my-sm"></switch-year>

        <q-btn
          v-if="user.yearKeyStatus === 2"
          flat
          outline
          round
          color="primary"
          icon="refresh"
          @click="user.needRefresh = true"
        />
      </q-toolbar>
      <q-separator />
    </q-header>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="180">
      <q-list>
        <q-item-label header> 菜单 </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
    <q-page-container>
      <div v-if="user.yearKeyStatus === 0 || user.auth_ing" class="q-pa-md">
        <q-inner-loading style="background-color: transparent" showing>
          <q-spinner-gears size="40px" color="primary" />
          <p>正在获取信息..</p>
        </q-inner-loading>
      </div>
      <div v-else>
        <q-page v-if="user.info === null" class="flex flex-center"
          ><ErrorText msg="请先登录"></ErrorText
        ></q-page>
        <q-page v-else-if="user.yearKeyStatus === 1" class="flex flex-center"
          ><ErrorText msg="获取学年信息失败"></ErrorText
        ></q-page>
        <div v-else>
          <router-view class="q-mt-md" />
          <div class="q-mt-md q-mb-sm" style="text-align: center">
            <p>
              Developed by Bhscer,
              <a
                href="https://github.com/bhscer/zufe_jw_helper_web"
                class="text-primary"
                style="text-decoration: none"
                >"Almost" Open Source</a
              >
            </p>
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import ToolbarBtnGroup from 'components/ToolbarBtnGroup.vue';
import switchYear from '@/components/switchYear.vue';
import { useUserStore } from '@/stores/user';

import EssentialLink from '@/components/EssentialLink.vue';
import ErrorText from '@/components/errorText.vue';
import { useRoute, useRouter } from 'vue-router';

const adminFuncList = [
  {
    title: '用户前台',
    link: '/zc',
  },
  {
    title: '班级概览',
    link: '/zc/admin/summary',
  },
  {
    title: '申请审批',
    link: '/zc/admin/records',
  },
];

const linksList = [
  {
    title: '概览',
    caption: '',
    icon: 'home',
    link: '/zc',
  },
  {
    title: '记录',
    caption: '',
    icon: 'code',
    link: '/zc/records',
  },
];
const user = useUserStore();
const router = useRouter();
const route = useRoute();

const selectedLink = ref(route.fullPath);
const leftDrawerOpen = ref(false);
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

let isZCAdmin = computed(() => {
  if (
    user.info &&
    user.info.adminDict &&
    user.info.adminDict['zongce'] &&
    user.info.adminDict['zongce'].length
  ) {
    return true;
  }
  return false;
});
watch(
  () => user.info?.adminDict,
  () => {
    initAdminSelection();
  }
);

watch(
  () => selectedLink.value,
  () => {
    router.push(selectedLink.value);
    user.needRefresh = true;
  }
);
function initAdminSelection() {
  if (isZCAdmin.value) {
    if (user.adminSelectClass === '') {
      user.adminSelectClass = user.info.adminDict['zongce'][0];
    }
  }
}

initAdminSelection();
document.querySelector('#loading-state')?.remove();
</script>
