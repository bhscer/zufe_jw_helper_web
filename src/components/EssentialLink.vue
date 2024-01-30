<template>
  <q-item
    clickable
    tag="a"
    :to="encodeURI(lpart !== null ? prefix + lpart : link)"
    :active="
      encodeURI(lpart !== null ? prefix + lpart : link) === $route.fullPath
    "
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: '',
    },

    link: {
      type: String,
      default: '#',
    },

    icon: {
      type: String,
      default: '',
    },

    prefix: {
      type: String,
      default: null,
    },
    lpart: {
      type: String,
      default: null,
    },
  },
});
</script>
