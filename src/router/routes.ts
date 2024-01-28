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
          {
            path: 'class/summary',
            component: () => import('pages/Book/Admin/classSummary.vue'),
          },
          {
            path: 'books/info',
            component: () => import('pages/Book/Admin/booksInfo.vue'),
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
    path: '/zc',
    component: () => import('layouts/ZongCeLayout.vue'),
    children: [
      { path: '', component: () => import('pages/ZongCe/IndexPage.vue') },
      {
        path: 'admin',
        children: [
          {
            path: 'records',
            component: () => import('pages/ZongCe/Admin/RecordsAdmin.vue'),
          },
          {
            path: 'summary',
            component: () => import('pages/ZongCe/Admin/SummaryPage.vue'),
          },
        ],
      },
      {
        path: 'records',
        component: () => import('pages/ZongCe/RecordsPage.vue'),
      },
      {
        path: 'item',
        children: [
          {
            path: encodeURI('智育/学习平均成绩'),
            children: [
              {
                path: 'new',
                component: () =>
                  import('pages/ZongCe/ItemDetail/ApplicatinMarkPage.vue'),
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordMarkPage.vue'),
              },
            ],
          },
          {
            path: encodeURI('体育/体育课或体测成绩'),
            children: [
              {
                path: 'new',
                component: () =>
                  import('pages/ZongCe/ItemDetail/ApplicatinMarkPage.vue'),
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordMarkPage.vue'),
              },
            ],
          },

          {
            path: 'record/:dbid',
            component: () => import('pages/ZongCe/ItemDetail/RecordPage.vue'),
          },
          {
            path: ':partName/:childrenName',
            children: [
              {
                path: '',
                component: () =>
                  import('pages/ZongCe/ItemDetail/SummaryPage.vue'),
              },
              {
                path: 'new',
                component: () =>
                  import('pages/ZongCe/ItemDetail/ApplicationPage.vue'),
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordPage.vue'),
              },
            ],
          },
        ],
      },
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
