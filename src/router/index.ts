import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useQuasar } from 'quasar';
const $q = useQuasar();
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    console.log(to); // 即将要跳转的路由
    console.log(from); // 即将要离开的路由
    if (localStorage.getItem('jw-auth-token')) {
      next();
    } else {
      if (to.path === '/login') {
        next();
      } else {
        try {
          $q.notify({
            type: 'negative',
            message: '请先登录',
            progress: true,
          });
        } catch {}

        next('/login');
      }
    }

    next(); // 一定要调用 ，执行之后的效果依赖next内带的参数
  });
  return Router;
});
