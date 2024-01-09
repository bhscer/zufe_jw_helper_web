<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <div class="q-mx-sm">
      <book-page
        :get_stu_info="getStuInfo"
        :set_stu_info="setStuInfo"
      ></book-page>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import bookPage from 'src/components/bookPage.vue';
import { defineComponent, ref, watch } from 'vue';
import BookPage from 'components/bookPage.vue';
const step = ref(1);
const can_go_next = ref(true);
const stu_info = ref({});

function changeCanGo(val: boolean) {
  can_go_next.value = val;
}
function goNext() {
  step.value += 1;
}
function setStuInfo(val: any) {
  stu_info.value = val;
}
function getStuInfo() {
  return stu_info.value;
}
watch(
  () => step.value,
  (to, from) => {
    if (to === 1) can_go_next.value = true;
  }
);
</script>
