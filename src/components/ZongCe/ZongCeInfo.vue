<template>
  <q-page v-if="processing" class="flex flex-center">
    <q-inner-loading
      v-if="err_msg.length == 0"
      :showing="processing"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在生成树</p>
    </q-inner-loading>
    <error-text v-else :msg="err_msg"></error-text>
  </q-page>
  <q-page class="q-pa-md" v-else>
    <div>
      <p>此页只统计已审批通过的分数</p>
    </div>

    <q-radio v-model="uiMode" val="tree" label="树视图" />
    <q-radio v-model="uiMode" val="table" label="表视图" />

    <q-separator class="q-my-md" />
    <q-tree
      v-if="uiMode === 'tree'"
      :nodes="processed_data"
      node-key="uid"
      default-expand-all
      no-transition
    >
      <template v-slot:default-header="prop">
        <div class="row items-center">
          <div
            v-if="prop.node.lv < 4"
            class="text-weight-bold"
            :class="'text-' + ['', 'h4', 'h5', 'h6', ''][prop.node.lv]"
          >
            {{
              `${prop.node.name}${
                prop.node.percent ? ' ' + prop.node.percent + '%' : ''
              }: ${prop.node.mark}分`
            }}
          </div>
          <div v-else>
            <a
              class="no-style-a"
              :href="`/zc/item/${prop.node.partName}/${prop.node.childrenName}/${prop.node.id}`"
              @click.prevent="
                $router.push(
                  encodeURI(
                    `/zc/item/${prop.node.partName}/${prop.node.childrenName}/${prop.node.id}`
                  )
                )
              "
            >
              <div>{{ prop.node.name }}</div>
            </a>
          </div>
        </div>
      </template>

      <template v-slot:default-body="prop">
        <div v-if="prop.node.lv === 3 && prop.node.editable">
          <a
            :href="`/zc/item/${prop.node.fa}/${prop.node.name}`"
            class="no-style-a"
            target="_blank"
            @click.prevent="
              $router.push(
                encodeURI(`/zc/item/${prop.node.fa}/${prop.node.name}`)
              )
            "
          >
            <q-icon name="edit"></q-icon>查看详情
          </a>
        </div>
      </template>
    </q-tree>

    <div v-if="uiMode === 'table'" class="text-h5 q-mb-md">
      {{ `总分: ${processed_data[0].mark}` }}
    </div>
    <q-markup-table separator="cell" v-if="uiMode === 'table'">
      <tbody>
        <tr v-for="item in processed_data_table" :key="item">
          <td v-if="item.fa_title" colspan="3">
            <div class="text-h5 q-my-md">{{ item.fa_title }}</div>
          </td>
          <td v-if="!item.fa_title">{{ item.name }}</td>
          <td v-if="!item.fa_title">
            <div v-for="drcd in item.details" :key="drcd">{{ drcd }}</div>
          </td>
          <td v-if="!item.fa_title">{{ item.mark }}</td>
        </tr>
      </tbody>
    </q-markup-table>
  </q-page>
</template>
<script setup lang="ts">
import errorText from '../errorText.vue';
import { onMounted, ref } from 'vue';
import _ from 'lodash';

const processing = ref(true);
const err_msg = ref('');
const uiMode = ref('tree');
const props = defineProps<{
  dt: any;
}>();

const processed_data = ref([]);
const processed_data_table = ref([]);

function process() {
  try {
    var rcd_cnt = 0;
    processed_data_table.value = [];
    processed_data.value = [_.cloneDeep(props.dt)];
    processed_data.value[0].uid = rcd_cnt++;
    processed_data.value[0].children = [];

    props.dt.children.forEach((el) => {
      var cur_part_data = el;
      cur_part_data.uid = rcd_cnt++;
      cur_part_data.chilren = [];

      var part_mark = 0.0;

      var tmp_list_4_table = [];
      el.children.forEach((cel) => {
        var cdata = cel;
        cdata.fa = el.name;
        cdata.uid = rcd_cnt++;

        var table_tmp_data = {
          name: cdata.name,
          mark: cdata.mark,
          details: [],
        };
        part_mark += cdata.mark;

        if (cdata.children) {
          cdata.children.forEach((item, idx) => {
            cdata.children[idx].partName = el.name;
            cdata.children[idx].childrenName = cel.name;
            cdata.children[idx].uid = rcd_cnt++;

            table_tmp_data.details.push(item.name);
          });
        }
        tmp_list_4_table.push(table_tmp_data);
        cur_part_data.chilren.push(cdata);
      });

      processed_data_table.value.push({
        fa_title: el.name,
      });
      tmp_list_4_table.push({
        name: '小计',
        mark: part_mark,
        details: [],
      });
      tmp_list_4_table.forEach((el) => {
        processed_data_table.value.push(el);
      });

      processed_data.value[0].children.push(cur_part_data);
    });
  } catch (error) {
    console.log(error);
    err_msg.value = '发生异常:\n' + error;
  }

  processing.value = false;
}

onMounted(() => {
  process();
});
</script>
<style>
.no-style-a {
  text-decoration: none;
  color: inherit;
}
</style>
