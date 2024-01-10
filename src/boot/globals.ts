import { boot } from 'quasar/wrappers';

import { inject } from '@vercel/analytics';
import 'viewerjs/dist/viewer.css';
import VueViewer from 'v-viewer';

export default boot(async ({ app }) => {
  inject();
  app.use(VueViewer);
});
