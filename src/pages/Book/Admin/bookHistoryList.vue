<template>
  <q-page class="flex flex-center" v-if="loading">
    <q-inner-loading
      :showing="loading"
      class="q-ma-sm"
      style="background-color: transparent"
    >
      <q-spinner-gears size="40px" color="primary" />
      <p>正在获取信息</p>
    </q-inner-loading>
  </q-page>
  <div v-else>
    <q-page v-if="err_msg.length" class="flex flex-center">
      <error-text :msg="err_msg"></error-text>
    </q-page>
    <q-page v-if="dt.length === 0" class="flex flex-center">
      <error-text msg="没有记录哦~"></error-text>
    </q-page>

    <div v-else>
      <div>{{ `已支付:${ana_paied}, 未支付:${ana_need_pay}` }}</div>
      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left" style="width: 5%">姓名</th>
            <th class="text-left" style="width: 5%">课表同步时间</th>
            <th class="text-left" style="width: 5%">课表信息</th>
            <th class="text-left" style="width: 5%">选书时间</th>
            <th class="text-left" style="width: 5%">选书信息</th>
            <th class="text-left" style="width: 5%">支付金额</th>
            <th class="text-center" style="width: 10%">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in dt" :key="idx">
            <td class="text-left">{{ item.stuName }}</td>
            <td>
              {{
                item.lastUpdate === -1
                  ? '未同步'
                  : $TimestampToDate(item.lastUpdate)
              }}
            </td>
            <td>
              {{
                item.lastUpdate === -1
                  ? ''
                  : item.classData.length === 0
                  ? '0门(或用户未同步就不订书)'
                  : item.classData[0] + ' 等' + item.classData.length + '门'
              }}

              <q-tooltip
                v-if="item.lastUpdate !== -1 && item.classData.length > 0"
              >
                {{ item.classData }}
              </q-tooltip>
            </td>
            <td>
              {{
                item.lastSelect === -1
                  ? '未选书'
                  : $TimestampToDate(item.lastSelect)
              }}
            </td>
            <td>
              {{
                item.lastSelect === -1
                  ? ''
                  : item.selectedList.length === 0
                  ? '0门'
                  : item.selectedList[0] +
                    ' 等' +
                    item.selectedList.length +
                    '门'
              }}

              <q-tooltip
                v-if="item.lastSelect !== -1 && item.selectedList.length > 0"
              >
                {{ item.selectedList }}
              </q-tooltip>
            </td>
            <td
              :class="
                Math.abs(item.payAmount - item.needPayAmount) < 1
                  ? ''
                  : 'text-red'
              "
            >
              {{
                `￥${item.payAmount.toFixed(2)}/￥${item.needPayAmount.toFixed(
                  2
                )}`
              }}
            </td>
            <td class="text-center">
              <q-btn
                label="查看"
                flat
                outline
                rounded
                color="primary"
                @click="
                  initDetailFormValues(idx);
                  showDetail = true;
                "
              ></q-btn>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>

  <q-dialog v-model="showDetail">
    <q-card class="q-pa-lg">
      <div>
        <span>姓名:</span
        ><span class="text-h6">{{ bookHistoryTmp.stuName }}</span>
      </div>

      <q-list bordered class="rounded-borders">
        <q-expansion-item
          expand-separator
          icon="bookmark_added"
          label="选书信息"
          default-opened
        >
          <q-card>
            <q-card-section>
              <q-checkbox
                v-model="needChangeSelectList"
                label="需要修改"
                color="teal"
              ></q-checkbox>
              <q-option-group
                class="q-my-sm"
                v-model="changeSelectionSelected"
                :options="
                  changeSelectionAllList.map((v, idx) => {
                    return {
                      label: v,
                      value: v,
                    };
                  })
                "
                color="primary"
                type="checkbox"
                :disable="!needChangeSelectList"
              >
                <template v-slot:label="opt">
                  <div class="row items-center">
                    <span>{{ opt.label }}</span>
                  </div>
                </template>
              </q-option-group>
              <div v-if="needChangeSelectList">
                请注意，如果修改订书内容后书本总价将会改变。 <br />
                这个过程不会自动完成，请手动刷新。
              </div>
              <q-btn
                v-if="needChangeSelectList"
                label="确认修改"
                @click="
                  bookHistoryTmp.selectedList = changeSelectionSelected;
                  editAlert();
                "
              ></q-btn>
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          expand-separator
          icon="bookmark_added"
          label="金额管理"
          default-opened
        >
          <q-card>
            <q-card-section>
              <div>
                <div>
                  已支付:<span class="text-red text-h6">{{
                    '￥' + bookHistoryTmp.payAmount
                  }}</span>
                  <q-checkbox
                    v-model="needChangeMoney"
                    label="需要修改金额"
                  ></q-checkbox>
                  <div v-if="needChangeMoney">
                    <div style="display: flex">
                      <q-select
                        v-model="changeTmpMoneyMode"
                        :options="changeTmpMoneyModeList"
                      ></q-select>
                      <q-input
                        v-model.number="changeTmpMoney"
                        label="更改金额"
                        type="number"
                        step="0.01"
                      ></q-input>
                      <div class="q-mt-auto text-h6">
                        <span>== ￥</span>
                        <!-- {{ '=' + (changeTmpMoneyMode === '增加' ? bookHistoryTmp.payAmount+changeTmpMoney) }} -->
                        <span v-if="changeTmpMoneyMode === '增加'">
                          {{
                            (changeTmpMoneyResult =
                              bookHistoryTmp.payAmount + changeTmpMoney)
                          }}
                        </span>
                        <span v-else-if="changeTmpMoneyMode === '修改为'">
                          {{ (changeTmpMoneyResult = changeTmpMoney) }}
                        </span>
                        <span v-else>
                          {{
                            (changeTmpMoneyResult =
                              bookHistoryTmp.payAmount - changeTmpMoney)
                          }}
                        </span>
                      </div>
                    </div>
                    <q-btn
                      label="确认修改"
                      @click="
                        bookHistoryTmp.payAmount = changeTmpMoneyResult;
                        editAlert();
                      "
                    ></q-btn>
                  </div>
                </div>
                <div>
                  需支付:<span class="text-red text-h6">{{
                    '￥' + bookHistoryTmp.needPayAmount
                  }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>

      <q-separator />
      <div>在提交修改前，请确认上方各项中点击过确认修改</div>
      <q-btn
        label="提交所有修改"
        @click="submitEdit()"
        :loading="submiting"
      ></q-btn>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { api } from '@/boot/axios';
import { useUserStore } from '@/stores/user';
import { Ref, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import ErrorText from '@/components/errorText.vue';
import _ from 'lodash';

const $q = useQuasar();
const user = useUserStore();
const loading = ref(false);
const err_msg = ref('');
const dt: Ref<AdminBookHistory[]> = ref([] as AdminBookHistory[]);
const showDetail = ref(false);
const bookHistoryTmp = ref(dt.value[0]);
const bookHistoryIdx = ref(0);

interface AdminBookHistory {
  stuId: string;
  stuName: string;
  lastUpdate: number;
  classData: string[];
  classSelectable: string[];
  lastSelect: number;
  selectedList: string[];
  payAmount: number;
  needPayAmount: number;
}

const submiting = ref(false);
const needChangeSelectList = ref(false);
const changeSelectionAllList = ref([] as string[]);
const changeSelectionSelected = ref([] as string[]);

const needChangeMoney = ref(false);
const changeTmpMoneyModeList = ['增加', '修改为', '减少'];
const changeTmpMoneyMode = ref(changeTmpMoneyModeList[0]);
const changeTmpMoneyResult: Ref<number> = ref(0);
const changeTmpMoney = ref(0);

function initDetailFormValues(idx: number) {
  bookHistoryIdx.value = idx;
  bookHistoryTmp.value = _.cloneDeep(dt.value[idx]);

  needChangeSelectList.value = false;
  changeSelectionAllList.value = _.cloneDeep(
    bookHistoryTmp.value.classSelectable
  );
  changeSelectionSelected.value = _.cloneDeep(
    bookHistoryTmp.value.selectedList
  );

  needChangeMoney.value = false;
  changeTmpMoney.value = 0;
}

function isSameList(arr1: string[], arr2: string[]) {
  return arr1.length === arr2.length && arr1.every((v, i) => v === arr2[i]);
}
function submitEdit() {
  submiting.value = true;
  api({
    method: 'post',
    url: `/admin/book/history/${user.semesterKey}/${bookHistoryTmp.value.stuId}/edit`,
    data: {
      payAmount: bookHistoryTmp.value.payAmount,
      selectedList: bookHistoryTmp.value.selectedList,
      newSelection: !isSameList(
        bookHistoryTmp.value.selectedList,
        dt.value[bookHistoryIdx.value].selectedList
      ),
    },
  })
    .then((data) => {
      $q.notify({
        type: 'positive',
        message: '修改成功',
        progress: true,
      });

      if (
        !isSameList(
          bookHistoryTmp.value.selectedList,
          dt.value[bookHistoryIdx.value].selectedList
        )
      ) {
        dt.value[bookHistoryIdx.value].lastSelect = new Date().getTime() / 1000;
      }
      dt.value[bookHistoryIdx.value].payAmount = bookHistoryTmp.value.payAmount;
      dt.value[bookHistoryIdx.value].selectedList =
        bookHistoryTmp.value.selectedList;

      submiting.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      console.error('Error:', error);
      submiting.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
      // err_msg.value = err_msg_notify;
    });
}
function editAlert() {
  $q.notify({
    type: 'positive',
    message: '已修改，注意需要手动提交',
    progress: true,
  });
}

const ana_paied = ref(0);
const ana_need_pay = ref(0);

function getBookHistoryList() {
  user.needRefresh = false;
  loading.value = true;
  err_msg.value = '';
  api({
    method: 'post',
    url: `/admin/book/${user.semesterKey}/${user.adminSelectClass}/history/list`,
  })
    .then((data) => {
      dt.value = data.data.reverse();
      ana_paied.value = 0;
      ana_need_pay.value = 0;
      dt.value.forEach((el) => {
        ana_paied.value += el.payAmount;
        ana_need_pay.value += el.needPayAmount;
      });
      loading.value = false;
    })
    .catch((error) => {
      // submiting.value = false;
      console.error('Error:', error);
      loading.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      // if (err_msg_notify !== '') {
      //   $q.notify({
      //     type: 'negative',
      //     message: err_msg_notify,
      //     progress: true,
      //   });
      // }
      err_msg.value = err_msg_notify;
    });
}
function shortTxt(txt: string) {
  if (txt.length <= 12) return txt;
  return txt.substring(0, 6) + '...' + txt.substring(txt.length - 6);
}
onMounted(() => {
  getBookHistoryList();
});

watch(
  () => user.needRefresh,
  (val, preVal) => {
    if (val === true) {
      user.needRefresh = false;
      getBookHistoryList();
    }
  }
);
</script>
