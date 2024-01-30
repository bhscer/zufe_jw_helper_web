import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { Dark } from 'quasar';

export const useVCStatStore = defineStore('vConsoleStat', () => {
  const behavior = ref<Status>(Status.Hide);

  watch(
    () => behavior.value,
    (d) => {
      apply();
    },
    { immediate: true }
  );

  function switchStat(to: Status) {
    behavior.value = to;
    apply();
  }

  function apply() {
    if (behavior.value === Status.Hide) {
      document
        .querySelector('#__vconsole')
        ?.setAttribute('style', 'display:none');
    } else {
      document.querySelector('#__vconsole')?.setAttribute('style', '');
    }
  }
  apply();

  return { behavior, switchStat, apply };
});

export enum Status {
  Display,
  Hide,
}
