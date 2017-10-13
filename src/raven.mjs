import childProcess from 'child_process';
import raven from 'raven';
import log from './log';

import { dsn } from '../config';


export default raven.config(dsn, {
  release: childProcess.execSync('git rev-parse HEAD').toString().trim(),
  environment: process.env.NODE_ENV,
}).install((err, sendErrFailed, eventId) => {
  if (sendErrFailed) {
    log('SENTRY FAIL', eventId, err.stack);
  } else {
    log('SENTRY', eventId);
  }
  process.exit(1);
});
