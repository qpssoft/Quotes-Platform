# Next Steps: Running the E2E Tests

## Current Status ✅

Phase 8 test infrastructure is **COMPLETE**:
- ✅ Playwright & Cucumber installed
- ✅ 33 test scenarios written (4 feature files)
- ✅ 120+ step definitions implemented
- ✅ All configuration files created
- ✅ All TypeScript lint errors fixed
- ✅ Test documentation complete

## Blocking Issue ⚠️

**Tests cannot run yet** because Angular components are missing `data-testid` attributes that the test selectors rely on.

## Required Changes to Angular Components

### 1. Quote Display Component
**File**: `quotes-platform/src/app/features/quote-display/quote-display.component.html`

Add these attributes:
```html
<div data-testid="quote-display">
  <p data-testid="quote-content">{{ currentQuote?.content }}</p>
  <p data-testid="quote-author">{{ currentQuote?.author }}</p>
  <span data-testid="quote-category">{{ currentQuote?.category }}</span>
</div>

<!-- For error handling -->
<div *ngIf="error" data-testid="error-message">{{ error }}</div>
```

### 2. Rotation Controls Component
**File**: `quotes-platform/src/app/features/rotation-controls/rotation-controls.component.html`

Add these attributes:
```html
<button data-testid="play-button" (click)="play()">Play</button>
<button data-testid="pause-button" (click)="pause()">Pause</button>
<button data-testid="next-button" (click)="next()">Next</button>

<select data-testid="timer-dropdown" (change)="onIntervalChange($event)">
  <option value="5">5 seconds</option>
  <option value="10">10 seconds</option>
  <option value="15">15 seconds</option>
  <option value="20">20 seconds</option>
  <option value="30">30 seconds</option>
  <option value="45">45 seconds</option>
  <option value="60">60 seconds</option>
</select>
```

### 3. Quote Grid Component
**File**: `quotes-platform/src/app/features/quote-grid/quote-grid.component.html`

Add these attributes:
```html
<div data-testid="quote-grid">
  <app-quote-card 
    *ngFor="let quote of displayedQuotes" 
    [quote]="quote"
    data-testid="quote-card">
  </app-quote-card>
</div>

<!-- Search and filters -->
<div data-testid="filter-controls">
  <input 
    data-testid="search-input" 
    type="text" 
    placeholder="Search quotes..." 
    [(ngModel)]="searchTerm" 
    (input)="onSearch()" />
  
  <button data-testid="clear-search" (click)="clearSearch()">X</button>
  
  <select data-testid="display-count" (change)="onDisplayCountChange($event)">
    <option value="5">5 quotes</option>
    <option value="10">10 quotes</option>
    <option value="15">15 quotes</option>
    <option value="20">20 quotes</option>
    <option value="25">25 quotes</option>
    <option value="30">30 quotes</option>
  </select>
  
  <select data-testid="font-selector" (change)="onFontChange($event)">
    <option value="system">System Default</option>
    <option value="noto-serif">Noto Serif</option>
    <option value="merriweather">Merriweather</option>
    <option value="playfair">Playfair Display</option>
    <option value="eb-garamond">EB Garamond</option>
    <option value="libre-baskerville">Libre Baskerville</option>
  </select>
</div>

<!-- No results message -->
<div *ngIf="displayedQuotes.length === 0" data-testid="no-results">
  No quotes found
</div>

<!-- Result count -->
<div data-testid="result-count">
  Showing {{ displayedQuotes.length }} of {{ totalQuotes }} quotes
</div>
```

### 4. Quote Card Component
**File**: `quotes-platform/src/app/shared/components/quote-card/quote-card.component.html`

Ensure parent component adds `data-testid="quote-card"` to each instance (see Quote Grid above).

## Quick Command Reference

### Install Dependencies (if not done)
```bash
cd quotes-platform
npm install
```

### Start the Application
```bash
npm run start
```
Application will run on `http://localhost:4200`

### Run E2E Tests (after adding data-testid attributes)

**Run all tests (headless)**:
```bash
npm run test:e2e
```

**Run with visible browser (debug)**:
```bash
npm run test:e2e:debug
```

**Run Playwright tests**:
```bash
npm run test:playwright
```

**Run with Playwright UI (interactive)**:
```bash
npm run test:playwright:ui
```

**Run in debug mode (step through)**:
```bash
npm run test:playwright:debug
```

**Run all tests (unit + E2E)**:
```bash
npm run test:all
```

### Run Specific Feature

```bash
npx cucumber-js tests/features/continuous-display.feature
npx cucumber-js tests/features/timer-configuration.feature
npx cucumber-js tests/features/quote-grid.feature
npx cucumber-js tests/features/search-filtering.feature
```

## Expected Test Results (First Run)

### Likely Failures
1. **Timing issues**: Some wait times may need adjustment
2. **Audio tests**: May fail due to browser autoplay restrictions
3. **Selector mismatches**: If data-testid doesn't match exactly

### Debugging Tips

**Take screenshots on failure**:
Screenshots are automatically saved to `test-results/screenshots/` when tests fail.

**Check console output**:
```bash
npm run test:e2e 2>&1 | tee test-output.log
```

**Slow down execution**:
In `playwright.config.ts`, add:
```typescript
use: {
  slowMo: 500  // Slow down by 500ms per action
}
```

**Run with headed browser**:
```bash
HEADLESS=false npm run test:e2e
```

## Test Reports

After running tests, view reports at:
- **HTML Report**: `quotes-platform/test-results/cucumber-report.html`
- **JSON Report**: `quotes-platform/test-results/cucumber-report.json`
- **Screenshots**: `quotes-platform/test-results/screenshots/`

## Verification Checklist

Before running tests:
- [ ] Application starts successfully on `http://localhost:4200`
- [ ] All 4 components have `data-testid` attributes added
- [ ] Attributes match exactly what's in step definitions
- [ ] Application displays quotes correctly in browser

First test run:
- [ ] Execute `npm run test:e2e`
- [ ] Document which tests pass/fail
- [ ] Review screenshot for failed tests
- [ ] Adjust timing if needed

## Estimated Time

- **Add data-testid attributes**: 30-60 minutes
- **First test run + debugging**: 1-2 hours
- **Fix flaky tests**: 1-2 hours
- **Total**: 2-4 hours to fully working test suite

## Success Criteria

✅ Test suite is successful when:
- All 33 scenarios pass
- Tests run in <10 minutes (single browser)
- No flaky tests (consistent pass/fail)
- Screenshot capture works on failure
- HTML report generates correctly

## Need Help?

1. **Read the full guide**: `quotes-platform/tests/README.md`
2. **Check step definitions**: `quotes-platform/tests/steps/*.steps.ts`
3. **Review feature files**: `quotes-platform/tests/features/*.feature`
4. **Consult documentation**:
   - [Playwright Docs](https://playwright.dev/)
   - [Cucumber Docs](https://cucumber.io/docs/cucumber/)

## After Tests Pass

Once all tests pass consistently:
- [ ] Complete T126: Document red/green test cycle
- [ ] Complete T133: Write edge case tests
- [ ] Complete T134: Run multi-browser tests
- [ ] Update Phase 8 completion status
- [ ] Celebrate! 🎉
