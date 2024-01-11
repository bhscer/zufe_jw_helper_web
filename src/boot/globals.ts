import { boot } from 'quasar/wrappers';

import { inject } from '@vercel/analytics';
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';

export default boot(async ({ app }) => {
  inject();
  app.use(VueViewer, {
    defaultOptions: {
      zIndex: 9999,
    },
  });
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
