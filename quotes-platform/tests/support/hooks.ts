import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { BuddhistQuotesWorld } from './world';

// Set default timeout to 60 seconds for all steps
setDefaultTimeout(60000);

BeforeAll(async function () {
  console.log('🧪 Starting Buddhist Quotes E2E Tests...');
});

Before(async function (this: BuddhistQuotesWorld) {
  await this.init();
});

After(async function (this: BuddhistQuotesWorld, { result, pickle }) {
  if (result?.status === Status.FAILED) {
    const screenshot = await this.page?.screenshot({ path: `test-results/screenshots/${pickle.name}.png` });
    if (screenshot) {
      this.attach(screenshot, 'image/png');
    }
  }
  await this.cleanup();
});

AfterAll(async function () {
  console.log('✅ Buddhist Quotes E2E Tests Complete!');
});
