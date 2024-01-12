import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/WelcomePage.vue'),
      },
      {
        path: 'login',
        component: () => import('pages/loginPage.vue'),
      },
    ],
  },
  {
    path: '/book',
    component: () => import('layouts/BookLayout.vue'),
    children: [
      {
        path: '',
        // component: () => import('layouts/MainLayout.vue'),
        children: [
          { path: '', component: () => import('pages/Book/IndexPage.vue') },
        ],
      },
      {
        path: 'admin',
        // component: () => import('layouts/MainLayout.vue'),
        children: [
          {
            path: 'take/list',
            component: () => import('pages/Book/Admin/takeListVerify.vue'),
          },
          {
            path: 'history/list',
            component: () => import('pages/Book/Admin/bookHistoryList.vue'),
          },
          // {
          //   path: 'CreateOperation',
          //   component: () => import('pages/Book/Admin/CreateOperation.vue'),
          // },
          // {
          //   path: 'CreateEmptySubmit',
          //   component: () => import('pages/Book/Admin/CreateEmptySubmit.vue'),
          // },
        ],
      },
      // {
      //   path: 'OperationPerform',
      //   // component: () => import('layouts/MainLayout.vue'),
      //   children: [
      //     { path: '', component: () => import('pages/Book/OperationPerform.vue') },
      //   ],
      // },
    ],
  },
  {
    path: '/Md5Encrypt',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/Md5Encrypt.vue') }],
  },
  {
    path: '/FileUpload',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/FileUpload.vue') }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
