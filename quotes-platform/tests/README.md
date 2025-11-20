# E2E Testing Guide - Buddhist Quotes Platform

## Overview

This project uses **Cucumber/Gherkin** for behavior-driven development (BDD) scenarios and **Playwright** for browser automation. Tests are written in TypeScript and cover all four user stories.

## Test Structure

```
tests/
├── features/              # Gherkin feature files (.feature)
│   ├── continuous-display.feature
│   ├── timer-configuration.feature
│   ├── quote-grid.feature
│   └── search-filtering.feature
├── steps/                 # Step definitions (.ts)
│   ├── continuous-display.steps.ts
│   ├── timer-configuration.steps.ts
│   ├── quote-grid.steps.ts
│   └── search-filtering.steps.ts
└── support/              # Test infrastructure
    ├── world.ts          # Playwright world setup
    └── hooks.ts          # Before/After hooks
```

## Prerequisites

- Node.js 18+ installed
- Application running on `http://localhost:4200`
- Chromium browser (auto-installed by Playwright)

## Installation

All dependencies are already installed if you ran `npm install`. If not:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install chromium
```

## Running Tests

### Cucumber/Gherkin BDD Tests

Run all feature files:
```bash
npm run test:e2e
```

Run with visible browser (debug mode):
```bash
npm run test:e2e:debug
```

Run specific feature:
```bash
npx cucumber-js tests/features/continuous-display.feature
```

### Playwright Tests

Run Playwright tests:
```bash
npm run test:playwright
```

Run with UI mode (interactive):
```bash
npm run test:playwright:ui
```

Run with debug mode:
```bash
npm run test:playwright:debug
```

### Run All Tests

Run both unit tests and E2E tests:
```bash
npm run test:all
```

## Test Coverage

### User Story 1: Continuous Quote Display (7 scenarios)
- ✅ Initial quote display on page load
- ✅ Automatic quote rotation after 15 seconds
- ✅ Audio notification on quote transition
- ✅ Play/Pause control functionality
- ✅ Next button skips to next quote immediately
- ✅ Consecutive quote prevention
- ✅ Error handling for JSON load failure

### User Story 2: Configurable Timer (7 scenarios)
- ✅ Default timer interval is 15 seconds
- ✅ Change timer interval to 30 seconds
- ✅ Timer preference persists across sessions
- ✅ Timer change takes effect immediately when paused
- ✅ Timer change takes effect on next interval when playing
- ✅ All timer options are available
- ✅ localStorage unavailable handling

### User Story 3: Quote Grid (7 scenarios)
- ✅ Quote grid displays below continuous display
- ✅ Desktop responsive layout (4 columns)
- ✅ Tablet responsive layout (2 columns)
- ✅ Mobile responsive layout (1 column)
- ✅ Quote cards display complete information
- ✅ Grid handles varying quote lengths gracefully
- ✅ Vertical scrolling for overflow content

### User Story 4: Search & Filtering (13 scenarios)
- ✅ Full-text search across quote content
- ✅ Search across author names
- ✅ Search across categories
- ✅ Case-insensitive search
- ✅ Clear search with X button
- ✅ No results message
- ✅ Change display count to 10 quotes
- ✅ Display count persists with search
- ✅ Font selection changes quote typography
- ✅ Font selection persists across navigation
- ✅ Search performance with large dataset
- ✅ Responsive filter controls on mobile

**Total: 34 BDD scenarios**

## Test Data Attributes

Ensure your components have these `data-testid` attributes:

```html
<!-- Quote Display -->
<div data-testid="quote-display">
  <p data-testid="quote-content">...</p>
  <p data-testid="quote-author">...</p>
  <span data-testid="quote-category">...</span>
</div>

<!-- Controls -->
<button data-testid="play-button">Play</button>
<button data-testid="pause-button">Pause</button>
<button data-testid="next-button">Next</button>
<select data-testid="timer-dropdown">...</select>

<!-- Quote Grid -->
<div data-testid="quote-grid">
  <div data-testid="quote-card">...</div>
</div>

<!-- Search & Filters -->
<input data-testid="search-input" />
<button data-testid="clear-search">X</button>
<select data-testid="display-count">...</select>
<select data-testid="font-selector">...</select>
<div data-testid="filter-controls">...</div>
<div data-testid="no-results">No quotes found</div>

<!-- Error Handling -->
<div data-testid="error-message">...</div>
```

## Writing New Tests

### 1. Create Gherkin Feature File

```gherkin
Feature: New Feature
  As a user
  I want to do something
  So that I can achieve a goal

  Scenario: Feature works correctly
    Given I have setup condition
    When I perform action
    Then I should see result
```

### 2. Implement Step Definitions

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { BuddhistQuotesWorld } from '../support/world';

Given('I have setup condition', async function (this: BuddhistQuotesWorld) {
  await this.page!.goto('http://localhost:4200');
});

When('I perform action', async function (this: BuddhistQuotesWorld) {
  await this.page!.click('[data-testid="my-button"]');
});

Then('I should see result', async function (this: BuddhistQuotesWorld) {
  const result = await this.page!.locator('[data-testid="result"]');
  await expect(result).toBeVisible();
});
```

## Configuration

### Cucumber Configuration (`cucumber.js`)

```javascript
module.exports = {
  default: {
    require: ['tests/steps/**/*.ts', 'tests/support/**/*.ts'],
    requireModule: ['ts-node/register'],
    format: ['progress-bar', 'html:test-results/cucumber-report.html']
  }
};
```

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI
  }
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Debugging Tips

1. **Run with visible browser**:
   ```bash
   HEADLESS=false npm run test:e2e
   ```

2. **Slow down execution**:
   ```bash
   SLOWMO=500 npm run test:e2e
   ```

3. **Take screenshots on failure**:
   Screenshots are automatically saved to `test-results/screenshots/`

4. **Use Playwright Inspector**:
   ```bash
   npm run test:playwright:debug
   ```

5. **Check console logs**:
   ```typescript
   this.page!.on('console', msg => console.log('PAGE LOG:', msg.text()));
   ```

## Best Practices

1. **Use data-testid for stable selectors** - Don't rely on CSS classes or text content
2. **Wait for network idle** - Use `waitForLoadState('networkidle')` after navigation
3. **Add appropriate timeouts** - Balance between speed and reliability
4. **Keep scenarios independent** - Each scenario should be able to run standalone
5. **Use Background for common setup** - Reduce duplication in feature files
6. **Make assertions meaningful** - Test actual behavior, not implementation details

## Troubleshooting

### Tests are flaky
- Increase wait times in `page.waitForTimeout()`
- Use `waitForSelector()` instead of fixed timeouts
- Check for race conditions in animations

### Cannot find elements
- Verify `data-testid` attributes are present
- Check if element is in an iframe
- Ensure element is visible (not hidden by CSS)

### Audio tests fail
- Audio autoplay restrictions vary by browser
- Use `context.grantPermissions(['audio'])`
- Check audio element exists even if playback can't be verified

### Performance tests are unreliable
- Performance varies by machine and load
- Use broader tolerance ranges
- Focus on relative performance, not absolute values

## Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Playwright Documentation](https://playwright.dev/)
- [BDD Best Practices](https://cucumber.io/docs/bdd/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

## Support

For issues or questions about the test suite, please:
1. Check this README
2. Review existing test files for examples
3. Consult Playwright/Cucumber documentation
4. Open an issue in the project repository
