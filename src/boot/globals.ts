import { boot } from 'quasar/wrappers';

import { inject } from '@vercel/analytics';
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';
import * as Sentry from '@sentry/vue';

export default boot(async ({ app }) => {
  inject();
  app.use(VueViewer, {
    defaultOptions: {
      zIndex: 9999,
    },
  });

  if (process.env.prod) {
    Sentry.init({
      app,
      dsn: 'https://9a3b8c2a7043f7a0bfe9d3ffe85fd980@o4506649028526080.ingest.sentry.io/4506649030557696',
      integrations: [
        new Sentry.BrowserTracing({
          // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
          // tracePropagationTargets: [
          //   'localhost',
          //   'jw.bhscer.com',
          //   'bhscer.gitee.io',
          // ],
        }),
        new Sentry.Replay({
          maskAllText: false,
          blockAllMedia: false,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    });
  }

  app.config.globalProperties.$TimestampToDate = (Timestamp: number) => {
    const now = new Date(Timestamp * 1000),
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
  };
});
