<template>
  <div>
    <div>前往领书时，请保证管理员在场，并对所领书目完成记录！</div>
    <q-list bordered class="rounded-borders">
      <q-expansion-item
        expand-separator
        icon="checklist"
        label="可拿书目"
        default-opened
      >
        <q-card>
          <q-card-section>
            <div v-if="needTakeList.length === 0">要领的书已经领完啦~</div>
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
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item expand-separator icon="list" label="未到书目">
        <q-card>
          <q-card-section>
            <class-and-book-table
              :need-take-list="dt.unreadyList"
            ></class-and-book-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item expand-separator icon="history" label="已拿记录">
        <q-card>
          <q-card-section>
            <take-record-card :records="dt.tookList"></take-record-card>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue';
import ClassAndBookTable from 'components/BookProcess/classAndBookTable.vue';
import TakeRecordCard from 'components/BookProcess/takeRecordCard.vue';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
import ImagesQuicklyCompress from 'images-quickly-compress';
interface BookDetailNoPrice {
  className: string;
  bookName: string;
}
interface TakeRecord {
  takeTime: number;
  takeList: BookDetailNoPrice[];
  imgId: string;
  approved: boolean;
}
const $q = useQuasar();
interface BookInfo_Take {
  status: number;
  msg: string;
  curType: number;

  bookList: BookDetailNoPrice[];
  unreadyList: BookDetailNoPrice[];
  tookList: TakeRecord[];
}

const props = defineProps<{
  dt: BookInfo_Take;
  semesterKey: string;
  refreshInfoFun: any;
}>();

const needTakeList: Ref<BookDetailNoPrice[]> = ref([]);

const takeBookDict: Ref<{ [key: string]: boolean }> = ref({});
var alreadyTakeBookNameList: string[] = [];
var unreadyTakeBookNameList: string[] = [];

function init() {
  takeBookDict.value = {};
  needTakeList.value = [];
  alreadyTakeBookNameList = [];
  unreadyTakeBookNameList = [];
  // 统计已拿的书的书名
  props.dt.tookList.forEach((takedt, idx) => {
    takedt.takeList.forEach((bookdt, idx) => {
      alreadyTakeBookNameList.push(bookdt.bookName);
    });
  });
  // 统计未到的书的书名
  props.dt.unreadyList.forEach((bookdt, idx) => {
    unreadyTakeBookNameList.push(bookdt.bookName);
  });

  props.dt.bookList.forEach((bookdt, idx) => {
    // 未到
    if (unreadyTakeBookNameList.indexOf(bookdt.bookName) !== -1) {
      return;
    }
    // 未拿为 selectList 中且未拿的
    if (alreadyTakeBookNameList.indexOf(bookdt.bookName) === -1) {
      needTakeList.value.push(bookdt);
      takeBookDict.value[bookdt.bookName] = false;
    }
  });
}

watch(
  () => props.dt,
  (val, preVal) => {
    init();
  }
);

onMounted(() => {
  init();
});
</script>
