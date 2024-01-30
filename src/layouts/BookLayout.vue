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
        <q-toolbar-title> 选书系统 </q-toolbar-title>
        <toolbar-btn-group></toolbar-btn-group>
      </q-toolbar>
      <q-separator />
      <q-toolbar>
        <q-select
          v-if="isBookAdmin"
          dense
          class="q-my-none"
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
          v-if="isBookAdmin && $route.fullPath.indexOf('admin') !== -1"
          dense
          class="q-my-none"
          outlined
          v-model="user.adminSelectClass"
          :options="user.info?.adminDict['book']"
          option-value="key"
          option-label="text"
          option-disable="inactive"
          map-options
          emit-value
          label="选择班级"
          @click="user.needRefresh = true"
        />
        <switch-semester class="q-my-sm"></switch-semester>

        <q-btn
          v-if="user.semesterKeyStatus === 2"
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
    <!-- <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      v-if="isBookAdmin"
      :width="180"
    >
      <q-list>
        <q-item-label header> 菜单 </q-item-label>

        <EssentialLink
          v-for="link in adminFuncList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->
    <q-page-container>
      <div v-if="user.semesterKeyStatus === 0 || user.auth_ing" class="q-pa-md">
        <q-inner-loading style="background-color: transparent" showing>
          <q-spinner-gears size="40px" color="primary" />
          <p>正在获取信息..</p>
        </q-inner-loading>
      </div>
      <div v-else>
        <q-page v-if="user.info === null" class="flex flex-center"
          ><ErrorText msg="请先登录"></ErrorText
        ></q-page>
        <q-page
          v-else-if="user.semesterKeyStatus === 1"
          class="flex flex-center"
          ><ErrorText msg="获取学期信息失败"></ErrorText
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
import switchSemester from '@/components/switchSemester.vue';
import { useUserStore } from '@/stores/user';

import EssentialLink from '@/components/EssentialLink.vue';
import ErrorText from '@/components/errorText.vue';
import { useRouter, useRoute } from 'vue-router';

const adminFuncList = [
  {
    title: '用户前台',
    link: '/book',
  },
  {
    title: '班级概览',
    link: '/book/admin/class/summary',
  },
  {
    title: '选书记录',
    link: '/book/admin/history/list',
  },
  {
    title: '领书记录',
    link: '/book/admin/take/list',
  },
  {
    title: '书本信息',
    link: '/book/admin/books/info',
  },
];
const user = useUserStore();
const router = useRouter();
const route = useRoute();

const selectedLink = ref(route.fullPath);
const leftDrawerOpen = ref(false);

let isBookAdmin = computed(() => {
  if (
    user.info &&
    user.info.adminDict &&
    user.info.adminDict['book'] &&
    user.info.adminDict['book'].length
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
  if (isBookAdmin.value) {
    if (user.adminSelectClass === '') {
      user.adminSelectClass = user.info.adminDict['book'][0];
    }
  }
}

initAdminSelection();
document.querySelector('#loading-state')?.remove();
</script>
