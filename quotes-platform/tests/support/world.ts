import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';

export class BuddhistQuotesWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init() {
    this.browser = await chromium.launch({
      headless: process.env['HEADLESS'] !== 'false',
      slowMo: process.env['SLOWMO'] ? parseInt(process.env['SLOWMO']) : 0,
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'en-US',
    });
    this.page = await this.context.newPage();
  }

  async cleanup() {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}

setWorldConstructor(BuddhistQuotesWorld);
