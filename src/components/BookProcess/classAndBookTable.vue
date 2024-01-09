<script setup lang="ts">
interface BookDetailNoPrice {
  className: string;
  bookName: string;
}
defineProps<{
  needTakeList: BookDetailNoPrice[];
}>();
</script>

<template>
  <div v-if="needTakeList.length === 0">该类目无数据~</div>
  <div v-else>
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">课程名</th>
          <th class="text-left">书名</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in needTakeList" :key="item">
          <td class="text-left">{{ item.className }}</td>
          <td class="text-left">{{ item.bookName }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<style scoped></style>
