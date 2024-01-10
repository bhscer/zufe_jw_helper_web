<script setup lang="ts">
import 'viewerjs/dist/viewer.css';

import ClassAndBookTable from 'components/BookProcess/classAndBookTable.vue';
import { Ref, ref } from 'vue';

interface BookDetailNoPrice {
  className: string;
  bookName: string;
}
interface TakeRecord {
  takeTime: number;
  takeList: BookDetailNoPrice[];
  takePhoto: string;
  approved: boolean;
}
defineProps<{
  records: TakeRecord[];
}>();

function TimestampToDate(Timestamp: number) {
  let now = new Date(Timestamp),
    y = now.getFullYear(),
    m = now.getMonth() + 1,
    d = now.getDate();
  return (
    y +
    '-' +
    (m < 10 ? '0' + m : m) +
    '-' +
    (d < 10 ? '0' + d : d) +
    ' ' +
    now.toTimeString().substr(0, 8)
  );
}

function shortTxt(txt: string) {
  if (txt.length <= 12) return txt;
  return txt.substring(0, 6) + '...' + txt.substring(txt.length - 6);
}
</script>

<template>
  <q-list bordered class="rounded-borders">
    <q-expansion-item
      :header-inset-level="1"
      :content-inset-level="1"
      v-for="record in records"
      :key="record"
      expand-separator
      icon="perm_identity"
    >
      <template v-slot:header>
        <q-item-section avatar>
          <q-avatar icon="book" />
        </q-item-section>

        <q-item-section>
          <div>
            {{
              `${shortTxt(record.takeList[0].bookName)}等${
                record.takeList.length
              }本`
            }}
          </div>
          <div>
            <q-icon name="schedule" />{{
              TimestampToDate(record.takeTime * 1000)
            }}
          </div>
        </q-item-section>

        <q-item-section side>
          <div v-if="record.approved">已审批</div>
          <div v-else class="text-red">未审批</div>
        </q-item-section>
      </template>
      <q-card>
        <q-card-section>
          <q-img :src="`${$api_url}book/take/img/${record.takePhoto}`" v-viewer>
            <template v-slot:error>
              <div
                class="absolute-full flex flex-center bg-negative text-white"
              >
                <div class="q-gutter-sm">
                  <p class="text-h4">:(</p>
                  <p>图片加载失败</p>
                </div>
              </div>
            </template>
          </q-img>
          <class-and-book-table
            :need-take-list="record.takeList"
          ></class-and-book-table>
        </q-card-section>
      </q-card>
    </q-expansion-item>
  </q-list>
</template>
