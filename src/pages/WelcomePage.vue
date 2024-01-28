<template>
  <q-page
    class="flex flex-center"
    style="flex-direction: column; flex-wrap: wrap"
  >
    <div
      class="animate__animated animate__backInDown q-gutter-sm"
      style="text-align: center"
    >
      <div
        class="text-h3"
        v-on:mouseenter="onMouseEnter($event, 'text-h3')"
        v-on:mouseleave="onMouseLeave($event, 'text-h3')"
      >
        教务助手
      </div>
    </div>
    <br />
    <br />
    <div
      class="q-gutter-sm animate__animated animate__slideInUp flex flex-center"
    >
      <a
        href="/book"
        target="_blank"
        class="no-style-a"
        v-on:mouseenter="onMouseEnter($event, 'no-style-a')"
        v-on:mouseleave="onMouseLeave($event, 'no-style-a')"
      >
        <div
          class="col gray-radius q-py-sm q-px-lg flex"
          @click.prevent="
            loading[0] = true;
            $router.push('/book');
          "
        >
          <q-circular-progress
            v-if="loading[0]"
            indeterminate
            rounded
            size="sm"
            class="q-my-auto q-mr-sm"
          />
          <q-icon
            v-else
            name="book"
            size="sm"
            class="q-my-auto q-mr-sm"
          ></q-icon>
          <div class="text-h6">选书系统</div>
        </div>
      </a>
      <a
        href="/zc"
        target="_blank"
        class="no-style-a"
        v-on:mouseenter="onMouseEnter($event, 'no-style-a')"
        v-on:mouseleave="onMouseLeave($event, 'no-style-a')"
      >
        <div
          class="col gray-radius q-py-sm q-px-lg flex"
          @click.prevent="
            loading[1] = true;
            $router.push('/zc');
          "
        >
          <q-circular-progress
            v-if="loading[1]"
            indeterminate
            rounded
            size="sm"
            class="q-my-auto q-mr-sm"
          />
          <q-icon
            v-else
            name="checklist"
            size="sm"
            class="q-my-auto q-mr-sm"
          ></q-icon>
          <div class="text-h6">综测系统</div>
        </div>
      </a>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import 'animate.css';
import { ref } from 'vue';

const loading = ref([false, false]);
function onMouseEnter(st, raw_class) {
  st.toElement.className =
    raw_class + ' animate__animated animate__pulse q-ma-lg';
}
function onMouseLeave(st, raw_class) {
  st.fromElement.className = raw_class;
}

test_sentry();
</script>
<style lang="scss">
.gray-radius {
  border-radius: 5px;
}
html[class='dark'] {
  .gray-radius {
    background-color: rgb(50, 50, 50);
  }
}
.gray-radius {
  background-color: gainsboro;
}

.no-style-a {
  text-decoration: none;
  color: inherit;
}
</style>
