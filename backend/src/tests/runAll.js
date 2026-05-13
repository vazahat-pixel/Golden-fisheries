import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info('=======================================================');
logger.info('  GOLDEN FISHERIES ERP ENTERPRISE TESTING ENGINE       ');
logger.info('  Executing Unit, Integration and Concurrency tests...');
logger.info('=======================================================');

run({
  files: [
    path.resolve(__dirname, 'validation.test.js'),
    path.resolve(__dirname, 'concurrency.test.js')
  ]
})
  .on('test:fail', (data) => {
    logger.error(`[Test Failed]: ${data.name}. Error: ${data.details?.error?.message}`);
  })
  .on('test:pass', (data) => {
    logger.info(`[Test Passed]: ${data.name}`);
  })
  .compose(new spec())
  .pipe(process.stdout);
