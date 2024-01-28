<template>
  <div>
    <div>
      <div v-if="dt.useJwc">
        <q-list bordered class="rounded-borders">
          <q-expansion-item
            v-if="dt.status === 1"
            expand-separator
            :default-opened="dt.status === 1"
            icon="bookmark_added"
            label="可订书目"
          >
            <q-card>
              <q-card-section>
                <div class="text-h6">
                  请勾选需要订书的科目（实际不一定有书）
                </div>
                <p v-if="lastSelect !== -1">
                  {{ `上次选书:${$TimestampToDate(lastSelect)}` }}
                </p>
                <p v-if="dt.selectableList.length === 0">无所需订书</p>
                <q-option-group
                  class="q-my-sm"
                  v-model="submitData.selectedList"
                  :options="
                    dt.selectableList.map((v, idx) => {
                      return {
                        label: v,
                        value: v,
                      };
                    })
                  "
                  color="primary"
                  type="checkbox"
                >
                  <template v-slot:label="opt">
                    <div class="row items-center">
                      <span>{{ opt.label }}</span>
                    </div>
                  </template>
                </q-option-group>
                <q-btn
                  label="提交"
                  @click="submitList"
                  color="primary"
                  :loading="submiting"
                />
              </q-card-section>
            </q-card>
          </q-expansion-item>
          <q-expansion-item
            v-if="dt.status === 1"
            expand-separator
            icon="bookmark_remove"
            label="无书课程"
          >
            <q-card>
              <q-card-section>
                <div v-if="dt.unselectableList.length > 0">
                  <p
                    v-for="item in dt.unselectableList"
                    :key="item"
                    class="q-pa-none q-ma-none"
                  >
                    {{ item }}
                  </p>
                </div>
                <div v-else>
                  <p>该类目数据不存在~</p>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <q-expansion-item
            :default-opened="dt.status === 2"
            expand-separator
            icon="travel_explore"
            :label="dt.status === 2 ? '请先同步课表' : '更新课表'"
          >
            <q-card>
              <q-card-section>
                <p class="q-mb-sm">
                  如果你未同步本学期课表或者你更改了选课,请点击更新课表按钮
                </p>
                <div class="q-gutter-sm">
                  <q-btn
                    label="更新课表"
                    @click="showJwcForm = true"
                    class="q-mb-sm"
                  ></q-btn>

                  <q-btn
                    v-if="dt.status === 2"
                    label="不同步了，我一本书都不买"
                    :loading="submitingNothing"
                    @click="submitNothing()"
                    class="q-mb-sm"
                  ></q-btn>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </div>
      <!-- 用户不接入教务处 手动输入科目 -->
      <div v-else>
        <p>您选择了不接入教务处，手动输入科目。</p>
        <p>
          请注意，请仔细检查输入每门科目，保证和教务处中的课程名称完全相同。
        </p>
        <p>
          具体课程名可参考你的课表，如“概率论与数理统计●”输入“概率论与数理统计”即可
        </p>
        <p>注意前后不要有空格，且最后的符号(★,◆,●,○)不要输入</p>
        <p>因课程名称不同导致的订书失败概不负责。</p>
        <q-btn
          outline
          color="primary"
          label="在前方插入"
          size="xs"
          padding="xs xs"
          @click="submitData.selectedList.splice(0, 0, '')"
        />
        <q-btn
          outline
          color="primary"
          label="在尾部插入"
          size="xs"
          padding="xs xs"
          @click="submitData.selectedList.push('')"
        />
        <div style="max-height: 400px; overflow: auto" class="q-mb-md q-mt-sm">
          <div
            v-for="(item, idx) in submitData.selectedList"
            :key="idx"
            style="padding-top: 20px"
          >
            <div>
              <strong>{{ `第${idx + 1}门` }}</strong>
              <q-btn
                outline
                color="red"
                label="删除"
                size="xs"
                padding="xs xs"
                @click="submitData.selectedList.splice(idx, 1)"
              />
              <q-btn
                outline
                color="primary"
                label="在前方插入"
                size="xs"
                padding="xs xs"
                @click="submitData.selectedList.splice(idx, 0, '')"
              />
            </div>
            <q-input
              outlined
              dense
              v-model="submitData.selectedList[idx]"
              label="科目名称"
            />
          </div>
        </div>
        <q-btn
          label="提交"
          @click="submitList"
          color="primary"
          :loading="submiting"
        />
      </div>
    </div>
  </div>

  <q-dialog v-model="showJwcForm">
    <q-card class="q-pa-lg">
      <p>请注意:同步课表后,选择历史、付款记录将被清空,请重新选书</p>
      <jwc-login
        :finish_return_stu_info="
          () => {
            showJwcForm = false;
            refreshInfoFun();
          }
        "
        mode="updateClassList"
        :semester-key="semesterKey"
      ></jwc-login>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { api } from 'boot/axios';
import { onMounted, Ref, ref } from 'vue';
import { useQuasar } from 'quasar';
import JwcLogin from 'components/jwcLogin.vue';
import { useUserStore } from '@/stores/user';

const submiting = ref(false);
const $q = useQuasar();
const user = useUserStore();
const showJwcForm = ref(false);
interface BookInfo_Edit {
  status: number;
  msg: string;
  curType: number;

  lastUpdate: number;
  selectableList: string[];
  unselectableList: string[];

  lastSelect: number;
  selectedList: string[];

  useJwc: boolean;
}
const props = defineProps<{
  dt: BookInfo_Edit;
  refreshInfoFun: any;
  semesterKey: string;
}>();

const lastSelect = ref(props.dt.lastSelect);
const submitingNothing = ref(false);
interface BookInfo_Edit_Submit {
  semesterKey: string;
  selectedList: string[];
}
const submitData: Ref<BookInfo_Edit_Submit> = ref({
  semesterKey: props.semesterKey,
  selectedList: props.dt.selectedList,
});

function submitNothing() {
  submitingNothing.value = true;

  api({
    method: 'post',
    url: `/book/edit/nothing/${user.semesterKey}`,
  })
    .then((data) => {
      submitingNothing.value = false;
      user.needRefresh = true;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
    })
    .catch((error) => {
      console.error('Error:', error);
      submitingNothing.value = false;
      var err_msg_notify = '';
      try {
        if (error.response.status === 401 || error.response.status === 400)
          err_msg_notify = error.response.data.detail;
        else err_msg_notify = '错误码' + error.response.status;
      } catch {
        err_msg_notify = '错误码' + error.code;
      }
      if (err_msg_notify === '') err_msg_notify = '未知错误';
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
function submitList() {
  submiting.value = true;
  submitData.value.semesterKey = user.semesterKey;
  api({
    method: 'post',
    url: '/book/edit',
    data: submitData.value,
  })
    .then((data) => {
      submiting.value = false;
      $q.notify({
        type: 'positive',
        message: '提交成功',
        progress: true,
      });
      lastSelect.value = new Date().getTime() / 1000;
    })
    .catch((error) => {
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
      if (err_msg_notify === '') err_msg_notify = '未知错误';
      if (err_msg_notify !== '') {
        $q.notify({
          type: 'negative',
          message: err_msg_notify,
          progress: true,
        });
      }
    });
}
</script>
