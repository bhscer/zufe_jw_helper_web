<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <q-card class="q-pa-lg">
      <div class="text-h5">md5加密</div>
      <p>请在下方输入您需要加密的文本(密码),即可获得加密结果</p>
      <q-input outlined v-model="pwd" label="原文" />
      <q-input outlined v-model="pwdMd5" label="密文" />
      <q-btn
        class="q-mt-md"
        label="复制密文"
        @click="copy_text(pwdMd5)"
        color="primary"
      />
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import md5 from 'js-md5';
import { useQuasar } from 'quasar';
import { defineComponent, ref, watch } from 'vue';
const $q = useQuasar();
const pwd = ref('');
const pwdMd5 = ref(md5(''));
watch(
  () => pwd.value,
  () => {
    pwdMd5.value = md5(pwd.value);
  }
);

function copy_text(text: string) {
  try {
    var input = document.createElement('input'); // js创建一个input输入框
    input.value = text; // 将需要复制的文本赋值到创建的input输入框中
    document.body.appendChild(input); // 将输入框暂时创建到实例里面
    input.select(); // 选中输入框中的内容
    document.execCommand('Copy'); // 执行复制操作
    document.body.removeChild(input); // 最后删除实例中临时创建的input输入框，完成复制操作

    $q.notify({
      type: 'positive',
      message: '复制成功',
      progress: true,
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: '复制失败',
      progress: true,
    });
  }
}
</script>
