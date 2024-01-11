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
  imgId: string;
  approvedCode: number;
}
defineProps<{
  records: TakeRecord[];
}>();

function shortTxt(txt: string) {
  if (txt.length <= 12) return txt;
  return txt.substring(0, 6) + '...' + txt.substring(txt.length - 6);
}
</script>

<template>
  <div v-if="records.length === 0">没有领书记录哦~</div>
  <q-list bordered class="rounded-borders" v-else>
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
            <q-icon name="schedule" />{{ $TimestampToDate(record.takeTime) }}
          </div>
        </q-item-section>

        <q-item-section side>
          <div v-if="record.approvedCode === 0">待审批</div>
          <div v-else-if="record.approvedCode === 1" class="text-green">
            已通过
          </div>
          <div v-else class="text-red">未通过</div>
        </q-item-section>
      </template>
      <q-card>
        <q-card-section>
          <q-img :src="`${$api_url}book/take/img/${record.imgId}`" v-viewer>
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
