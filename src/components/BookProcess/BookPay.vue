<template>
  <div>
    <q-markup-table>
      <thead>
        <tr>
          <th>课程名</th>
          <th>书名</th>
          <th>定金</th>
          <th>尾款</th>
          <th>总价</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in dt.selectedList" :key="item">
          <td>{{ item.className }}</td>
          <td>{{ item.bookName }}</td>
          <td>{{ item.price[0].toFixed(2) }}</td>
          <td>{{ item.price[1].toFixed(2) }}</td>
          <td>
            {{ (item.price[0] + item.price[1]).toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <q-separator class="q-my-md"></q-separator>
    <div>
      <div>
        <span>总价:</span>
        <span class="text-h6">{{ '￥' + totalAmount }}</span>
      </div>
      <div>
        <span>已支付:</span>
        <span class="text-h6">{{ '￥' + dt.payAmount }}</span>
      </div>
      <div>
        <span>需支付:</span>
        <span class="text-h5 text-primary">{{
          '￥' + (totalAmount - dt.payAmount)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface BookDetail {
  className: string;
  bookName: string;
  price: number[];
}

interface BookInfo_Pay {
  status: number;
  msg: string;
  curType: number;

  selectedList: BookDetail[];
  payAmount: number;
}

const props = defineProps<{
  dt: BookInfo_Pay;
  semesterKey: string;
}>();
const totalAmount = ref(0.0);

onMounted(() => {
  for (var i = 0; i < props.dt.selectedList.length; i++) {
    totalAmount.value += props.dt.selectedList[i].price[0];
    totalAmount.value += props.dt.selectedList[i].price[1];
  }
});

// watch(
//     ()=>props.semesterKey,
//     (val,preVal)=>{
//       console.log('changed')
//     },
//     {
//       immediate:true,
//     }
// )
</script>
