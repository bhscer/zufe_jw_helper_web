import { defineStore } from 'pinia';
import { user } from '../lib/api/user';
import { ref, computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

// 第一个参数是应用程序中 store 的唯一 id
export const useUserStore = defineStore('user', () => {
  // 其它配置项
  const info = ref<null | user.UserInfo>(null);
  const exists = computed(() => info.value !== null);
  const router = useRouter();
  const route = useRoute();
  const $q = useQuasar();
  const auth_ing = ref(false);
  const semesterKeyStatus = ref(0); // 0:loading, 1:error, 2:ok
  const semesterKey = ref('');
  const adminSelectClass = ref('');
  const needRefresh = ref(false);
  const yearKey = ref('');
  const yearKeyStatus = ref(0); // 0:loading, 1:error, 2:ok
  const viewingStuName = ref('');

  function login(form: user.LoginForm) {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .login(form)
        .then((d) => {
          const user = d.data;
          info.value = user;
          // users.push(user);
          localStorage.setItem('jw-auth-token', d.data.token);
          resolve(user);
        })
        .catch(reject);
    });
  }

  function register(form: user.RegisterForm) {
    return new Promise<user.UserInfo>((resolve, reject) => {
      user
        .register(form)
        .then((d) => {
          const user = d.data;
          // info.value = user;
          resolve(user);
        })
        .catch(reject);
    });
  }
  function logout() {
    return new Promise((resolve, reject) => {
      localStorage.removeItem('jw-auth-token');
      info.value = null;
      resolve(void 0);
    });
  }

  // auth
  if (localStorage.getItem('jw-auth-token')) {
    auth_ing.value = true;
    user
      .auth()
      .then((d) => {
        info.value = d.data;
        localStorage.setItem('jw-auth-token', d.data.token);
        needRefresh.value = true;
        auth_ing.value = false;
      })
      .catch((error) => {
        auth_ing.value = false;
        let err_msg = '';
        try {
          if (error.response.status === 401 || error.response.status === 400) {
            err_msg = error.response.data.detail;
            localStorage.removeItem('jw-auth-token');
          } else {
            err_msg = '错误:' + error.response.status;
          }
        } catch {
          err_msg = '错误:' + error.code;
        }
        $q.notify({
          type: 'negative',
          message: err_msg,
          progress: true,
        });
      });
  }

  return {
    info,
    exists,
    login,
    register,
    logout,
    auth_ing,
    semesterKey,
    semesterKeyStatus,
    needRefresh,
    adminSelectClass,
    yearKey,
    yearKeyStatus,
    viewingStuName,
  };
});
