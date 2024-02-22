import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/WelcomePage.vue'),
        meta: {
          title: '欢迎进入教务助手',
        },
      },
      {
        path: 'login',
        component: () => import('pages/loginPage.vue'),
        meta: {
          title: '登录 - 教务助手',
        },
      },
    ],
  },
  {
    path: '/book',
    component: () => import('layouts/BookLayout.vue'),
    meta: {
      title: '订书 - 教务助手',
    },
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
            path: 'take/upload',
            component: () => import('pages/Book/Admin/TakeUpload.vue'),
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
    meta: {
      title: '综测 - 教务助手',
    },
    children: [
      { path: '', component: () => import('pages/ZongCe/IndexPage.vue') },
      {
        path: 'word',
        component: () => import('pages/ZongCe/WordOutput.vue'),
        meta: {
          title: '登记表导出 - 综测 - 教务助手',
        },
      },
      {
        path: 'admin',
        children: [
          {
            path: 'records',
            component: () => import('pages/ZongCe/Admin/RecordsList.vue'),
          },
          {
            path: 'record/:dbid',
            component: () => import('pages/ZongCe/Admin/RecordAdmin.vue'),
          },
          {
            path: 'summary',
            component: () => import('pages/ZongCe/Admin/SummaryPage.vue'),
          },
          {
            path: 'view/:viewedStuId/:viewedStuName',
            children: [
              {
                path: '',
                component: () => import('pages/ZongCe/IndexPage.vue'),
              },

              {
                path: 'word',
                component: () => import('pages/ZongCe/WordOutput.vue'),
              },
              {
                path: 'records',
                component: () => import('pages/ZongCe/RecordsPage.vue'),
              },
              {
                path: 'item',
                children: [
                  {
                    path: 'record/:dbid',
                    component: () =>
                      import('pages/ZongCe/ItemDetail/RecordPage.vue'),
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
                        path: ':dbid',
                        component: () =>
                          import('pages/ZongCe/Admin/RecordAdmin.vue'),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'records',
        component: () => import('pages/ZongCe/RecordsPage.vue'),
        meta: {
          title: '我的申请记录 - 综测 - 教务助手',
        },
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
                meta: {
                  title: '新建申请 - 综测 - 教务助手',
                },
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordMarkPage.vue'),
                meta: {
                  title: '申请详情 - 综测 - 教务助手',
                },
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
                meta: {
                  title: '新建申请 - 综测 - 教务助手',
                },
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordMarkPage.vue'),
                meta: {
                  title: '申请详情 - 综测 - 教务助手',
                },
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
                meta: {
                  title: '板块概览 - 综测 - 教务助手',
                },
              },
              {
                path: 'new',
                component: () =>
                  import('pages/ZongCe/ItemDetail/ApplicationPage.vue'),
                meta: {
                  title: '新建申请 - 综测 - 教务助手',
                },
              },
              {
                path: ':dbid',
                component: () =>
                  import('pages/ZongCe/ItemDetail/RecordPage.vue'),
                meta: {
                  title: '申请详情 - 综测 - 教务助手',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/test_img_upload',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PicUploadTest.vue') },
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
