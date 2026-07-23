# Playwright Interview Guide

---

## 1. Element Locator Methods

Playwright provides 13+ ways to identify elements, ordered here by **Playwright's own recommended priority** (most resilient first):

### Built-in Locators (Most → Least Preferred)

#### 1. `getByRole()` — ARIA role + accessible name

```ts
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Welcome' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'About Us' })
page.getByRole('checkbox', { name: 'Agree' })
```

**Why #1:** Matches how assistive technologies (screen readers) see the page. Immune to CSS class changes. If an element is accessible, it's locatable.

#### 2. `getByLabel()` — Form label text

```ts
page.getByLabel('Email address')
page.getByLabel('Password')
```

**Why #2:** Ties to `<label for="...">` — what the user actually reads. Works even if the input ID is auto-generated.

#### 3. `getByPlaceholder()` — Input placeholder attribute

```ts
page.getByPlaceholder('Enter your username')
```

**Why #3:** Also user-facing. Good for form fields that lack explicit labels.

#### 4. `getByText()` — Visible text content

```ts
page.getByText('Products')
page.getByText('Checkout')
page.getByText(/Welcome, \w+/)   // regex
```

**Why #4:** Matches visible text on the page. Can use exact string or regex.

#### 5. `getByAltText()` — Image alt attribute

```ts
page.getByAltText('Product thumbnail')
```

**Why #5:** Matches the `alt` attribute — also an accessibility win.

#### 6. `getByTitle()` — Element title attribute

```ts
page.getByTitle('More information')
```

**Why #6:** Matches the `title` attribute (tooltip text). Less common but useful for icons without visible text.

#### 7. `getByTestId()` — data-testid attribute

```ts
page.getByTestId('product-sort-container')
```

**Why #7:** Corresponds to `data-testid="..."` in HTML. Purpose-built for testing — highest stability when available. Customize the attribute name in config:

```ts
use: {
  testIdAttribute: 'data-test',  // defaults to 'data-testid'
}
```

### Flexible Locators

#### 8. `page.locator()` — CSS/XPath selectors

```ts
page.locator('.shopping_cart_badge')                    // CSS class
page.locator('#submit-btn')                              // CSS id
page.locator('button')                                   // Tag name
page.locator('button:has-text("Add to cart")')          // CSS + text pseudo
page.locator('//button[@name="login"]')                  // XPath
page.locator('input[type="email"]')                      // Attribute selector
```

**Note:** Least resilient — tied to DOM structure. Use only when built-in locators won't work.

#### 9. `page.locator().filter()` — Narrow down matches

```ts
page.locator('button').filter({ hasText: 'Add to cart' })
page.locator('li').filter({ has: page.getByRole('heading') })
page.locator('tr').filter({ hasNot: page.locator('.disabled') })
```

**Options:**

| Option | What it does |
|---|---|
| `{ hasText: 'text' }` | Matches elements containing given text |
| `{ hasText: /regex/ }` | Text matches a regex pattern |
| `{ has: anotherLocator }` | Matches elements that contain a child matching another locator |
| `{ hasNot: anotherLocator }` | Matches elements that do NOT contain a child matching another locator |

#### 10. Positional — `.nth()` / `.first()` / `.last()`

```ts
page.locator('button').first()     // index 0
page.locator('button').nth(2)      // index 2
page.locator('button').last()      // last match
```

**Warning:** Fragile — adding a single element breaks indices. Prefer `.filter()` when content identifies the element.

### Chaining / Scoping

#### 11. Chaining locators

```ts
const card = page.locator('.product-card');
await card.locator('button').click();
await card.getByRole('heading').textContent();
```

Narrows scope. More readable than compound CSS selectors.

#### 12. `page.locator().and()` — Combine conditions

```ts
page.locator('button').and(page.getByText('Submit'))
```

#### 13. `page.locator().or()` — Match any

```ts
page.locator('button').or(page.getByRole('link'))
```

### Priority Summary

| Priority | Method | Resiliency | Reason |
|---|---|---|---|
| 1 | `getByRole()` | High | Accessibility tree |
| 2 | `getByLabel()` | High | Form labels |
| 3 | `getByPlaceholder()` | High | User-facing text |
| 4 | `getByText()` | High | Visible text |
| 5 | `getByAltText()` | High | Image alt text |
| 6 | `getByTitle()` | Medium | Tooltip text |
| 7 | `getByTestId()` | Highest | Purpose-built for testing |
| 8 | `locator()` with CSS/XPath | Low | DOM structure — breaks easily |

**Interview tip:** User-facing locators (role, label, text) work without modifying the app and inherently prove accessibility. `getByTestId()` is the most stable when available, but requires developer buy-in.

---

## 2. Text & Value Extraction Methods

### Text Extraction

#### 1. `textContent()` — Raw DOM text

```ts
const text = await page.locator('h1').textContent();
// returns: string | null
```

Returns `Node.textContent` — all text inside the element, including hidden elements and `<script>`/`<style>` contents. Whitespace is preserved as-is.

#### 2. `innerText()` — Visible text only

```ts
const text = await page.locator('h1').innerText();
// returns: string
```

Returns `HTMLElement.innerText` — only text that is **visibly rendered**. Respects CSS: ignores `display:none`, `visibility:hidden`, and normalizes whitespace like a browser would.

#### 3. `allTextContents()` — Text from all matches

```ts
const names = await page.locator('.item-name').allTextContents();
// returns: string[] — e.g., ['Backpack', 'Jacket', 'Bolt T-Shirt']
```

Returns `textContent()` for every matching element as an array.

#### 4. `allInnerTexts()` — Visible text from all matches

```ts
const visibleNames = await page.locator('.item-name').allInnerTexts();
// returns: string[]
```

Returns `innerText()` for every matching element.

### Input Value Extraction

#### 5. `inputValue()` — Form control value

```ts
const email = await page.getByLabel('Email').inputValue();
// returns: string
```

Works on `<input>`, `<textarea>`, `<select>`, and `contenteditable` elements.

#### 6. `inputValues()` — Values from all matching inputs

```ts
const allValues = await page.locator('input[type="text"]').inputValues();
// returns: string[]
```

### Attribute Extraction

#### 7. `getAttribute()` — Any HTML attribute

```ts
const href = await page.getByRole('link').getAttribute('href');
const isExpanded = await page.getByRole('button').getAttribute('aria-expanded');
// returns: string | null
```

Returns `null` if the attribute doesn't exist.

### Advanced DOM Extraction

#### 8. `innerHTML()` — Raw inner HTML

```ts
const html = await page.locator('.container').innerHTML();
// returns: string — e.g., '<p>Hello <b>World</b></p>'
```

Rare in QA; useful for rich text editors or SSR markup validation.

#### 9. `evaluate()` / `evaluateAll()` — Arbitrary JavaScript

```ts
// Single element
const width = await page.locator('.box').evaluate(el => {
    return el.getBoundingClientRect().width;
});

// All matching elements
const hrefs = await page.locator('a').evaluateAll(links => {
    return links.map(l => l.getAttribute('href'));
});
```

Use for: computed styles, bounding rect, shadow DOM, canvas/SVG data.

### Comparison Table

| Method | Returns | Works on | Hidden text? | Style-aware? |
|---|---|---|---|---|
| `textContent()` | `string \| null` | Any element | Yes | No |
| `innerText()` | `string` | Any element | No | Yes |
| `allTextContents()` | `string[]` | All matches | Yes | No |
| `allInnerTexts()` | `string[]` | All matches | No | Yes |
| `inputValue()` | `string` | Input/select/textarea | N/A | N/A |
| `inputValues()` | `string[]` | All matching inputs | N/A | N/A |
| `getAttribute(name)` | `string \| null` | Any element | N/A | N/A |
| `innerHTML()` | `string` | Any element | N/A | N/A |
| `evaluate(fn)` | Any | Any element | N/A | N/A |
| `evaluateAll(fn)` | Any | All matches | N/A | N/A |

**Interview tip:** `textContent()` vs `innerText()` — the former reads the DOM tree, the latter reads the **rendered output**. A common bug: `textContent()` returns text from a `display:none` error message the user can't see, leading to false negatives.

---

## 3. Table Data Extraction Patterns

### 1. Extract All Row Text at Once

```ts
const rowTexts = await page.locator('table tr').allTextContents();
// ['Header1 Header2 Header3', 'Row1Cell1 Row1Cell2 Row1Cell3', ...]
```

### 2. Extract a Single Column

```ts
// Column 2 — CSS :nth-child() applied per-ancestor
const prices = await page.locator('table tr td:nth-child(2)').allTextContents();
// ['$7.99', '$9.99', '$15.99']
```

**Important:** Use CSS `:nth-child()` inside the selector string, NOT Playwright's `.nth()`. Playwright's `.nth()` picks one match total; CSS `:nth-child()` applies per row.

### 3. Extract as Array of Arrays (Matrix)

```ts
const rows = page.locator('table tbody tr');
const rowCount = await rows.count();
const table: string[][] = [];

for (let i = 0; i < rowCount; i++) {
    const cells = rows.nth(i).locator('td');
    const cellTexts = await cells.allTextContents();
    table.push(cellTexts);
}
// [ ['Backpack', '$7.99'], ['Jacket', '$9.99'], ... ]
```

### 4. Extract as Array of Typed Objects

```ts
interface Product {
    name: string;
    price: string;
    description: string;
}

const rows = page.locator('table tbody tr');
const rowCount = await rows.count();
const products: Product[] = [];

for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    products.push({
        name: await row.locator('td').nth(0).textContent() ?? '',
        price: await row.locator('td').nth(1).textContent() ?? '',
        description: await row.locator('td').nth(2).textContent() ?? '',
    });
}

// Assertions:
expect(products[0].name).toBe('Sauce Labs Backpack');
expect(parseFloat(products[0].price.replace('$', ''))).toBeLessThan(10);
```

### 5. Find Row by Content, Then Extract

```ts
// Find the row containing "Backpack"
const targetRow = page.locator('table tr').filter({ hasText: 'Backpack' });

// Extract specific cells from that row
const price = await targetRow.locator('td').nth(1).textContent();
expect(price).toBe('$29.99');
```

No need to know the row index — filter finds by content, making the test resilient to reordering.

### 6. Verify an Entire Column Satisfies a Condition

```ts
const priceTexts = await page.locator('table td:nth-child(2)').allTextContents();
const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));

for (let i = 0; i < prices.length - 1; i++) {
    expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
}
```

### 7. Extract with `evaluateAll()` for Complex Parsing

```ts
const rowData = await page.locator('table tr').evaluateAll(rows =>
    rows.map(row => ({
        text: row.textContent?.trim(),
        classes: row.className,
        isHighlighted: row.classList.contains('selected'),
        cellCount: row.querySelectorAll('td').length,
    }))
);
```

### 8. Row Count Patterns

```ts
await rows.count()                    // immediate count (no retry)
await expect(rows).toHaveCount(5)     // auto-retries until count is 5
```

**Interview trap:** `await rows.count()` returns immediately — no retry. If rows load async:

```ts
// BAD — rows might still be loading
const count = await rows.count();  // could be 0

// GOOD — waits for 5 rows, then counts
await expect(rows).toHaveCount(5);
const count = await rows.count();  // guaranteed 5
```

### `.nth()` vs `.filter()` Decision

| `.nth()` | `.filter()` |
|---|---|
| Position matters ("first item in results") | Content matters ("row containing 'th1'") |
| Order is deterministic and stable | Content is unique enough to identify |
| Fragile — adding a row breaks index | Resilient — survives DOM reordering |

---

## 4. API Mocking Approaches

### Approach 1: `page.route()` — Intercept & Mock

You sit between the browser and server. Catch requests and decide: forward, modify, or return fake responses.

```ts
await page.route('**/api/products', async route => {
    // Option A: Let it pass through
    await route.continue();

    // Option B: Fake a successful response
    await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 1, name: 'Mocked Product', price: 9.99 }]),
    });

    // Option C: Simulate a server error
    await route.fulfill({ status: 500, body: 'Internal Server Error' });

    // Option D: Abort the request
    await route.abort('connectionrefused');
});
```

#### Visual Flow

```
Browser ──GET /api/products──▶ [page.route()] ──▶ Real Server
                                    │
                                    │ fulfill({ body: fakeData })
                                    │
                                    ▼
                              Browser receives fake response
                              (never reaches real server)
```

#### Modify a Real Response

```ts
await page.route('**/api/products', async route => {
    const response = await route.fetch();   // fetch from real server
    const json = await response.json();
    json[0].price = '999.99';               // modify
    await route.fulfill({ response, json }); // return modified
});
```

### Approach 2: `page.request` — Direct API Calls (No Browser)

```ts
const apiContext = await request.newContext({
    baseURL: 'https://api.example.com',
});

// POST
const createRes = await apiContext.post('/products', {
    data: { name: 'Widget', price: 9.99 },
});
expect(createRes.status()).toBe(201);

// GET
const getRes = await apiContext.get('/products/1');
const product = await getRes.json();
expect(product.name).toBe('Widget');

// DELETE
await apiContext.delete('/products/1');
```

**Use when:**
- You need test data to exist before the UI test runs
- You need to reset state between tests
- You want to test the API itself (no browser overhead)

### Approach 3: Combined Pattern

```ts
test('product list shows mocked data', async ({ page, request }) => {
    // Mock the GET endpoint
    await page.route('**/api/products', async route => {
        await route.fulfill({
            json: [
                { id: 1, name: 'Test Backpack', price: 29.99 },
                { id: 2, name: 'Test Jacket', price: 49.99 },
            ],
        });
    });

    // Go to the UI that calls this API
    await page.goto('/products');

    // Assert UI renders mocked data
    await expect(page.getByText('Test Backpack')).toBeVisible();
    await expect(page.getByText('$29.99')).toBeVisible();
});
```

### `route` Methods Cheat Sheet

| Method | What it does | Real server contacted? |
|---|---|---|
| `route.fulfill({ json: data })` | Return fake response directly | No |
| `route.fulfill({ body: string })` | Return fake response (string body) | No |
| `route.continue()` | Forward request as-is | Yes |
| `route.continue({ postData: newBody })` | Forward with modified data | Yes |
| `route.abort()` | Cancel the request | No |
| `route.fetch()` | Manually fetch from real server | Yes |
| `route.fulfill({ response, json: modified })` | Fetch real, modify, return | Yes (via `route.fetch()`) |

### URL Matching Patterns

```ts
page.route('**/api/products')              // matches any URL ending with /api/products
page.route('https://api.example.com/**')   // matches all paths on that domain
page.route('**/*.{png,jpg}')               // matches image URLs
page.route(url => url.includes('/api'))    // function predicate
page.route(/\/api\/v\d+\//)                // regex pattern
```

---

## 5. Assertion Reference

### Web-First Assertions (Retry Automatically)

These auto-retry until the condition is met or the timeout expires. They are the **#1 reason** Playwright tests are less flaky than Selenium.

| Assertion | Use case | Example |
|---|---|---|
| `toHaveURL(regex)` | Verify correct page loaded | `expect(page).toHaveURL(/inventory.html/)` |
| `toHaveTitle(regex)` | Verify page title | `expect(page).toHaveTitle(/Playwright/)` |
| `toBeVisible()` | Verify element is rendered | `expect(locator).toBeVisible()` |
| `toHaveText(string)` | Verify exact text content | `expect(locator).toHaveText('Backpack')` |
| `toHaveCount(n)` | Verify number of elements | `expect(rows).toHaveCount(5)` |
| `toHaveValue(string)` | Verify input value | `expect(input).toHaveValue('user@test.com')` |
| `toBeChecked()` | Verify checkbox/radio state | `expect(checkbox).toBeChecked()` |
| `toBeEnabled()` / `toBeDisabled()` | Verify interactive state | `expect(button).toBeEnabled()` |
| `toContainText(string)` | Partial text match | `expect(locator).toContainText('Pack')` |
| `toHaveAttribute(name, value)` | Verify attribute | `expect(img).toHaveAttribute('alt', 'Logo')` |
| `toHaveScreenshot()` | Visual regression | `expect(page).toHaveScreenshot()` |

### Non-Retrying Assertions (Immediate)

For values already extracted from the page (not locators).

| Assertion | Example |
|---|---|
| `toBe(value)` | `expect(badgeCount).toBe('1')` |
| `toBeLessThan(value)` | `expect(price).toBeLessThan(100)` |
| `toBeLessThanOrEqual(value)` | `expect(prices[i]).toBeLessThanOrEqual(prices[i+1])` |
| `not.toBeNull()` | `expect(name).not.toBeNull()` |
| `toEqual(object)` | `expect(apiRes).toEqual({ id: 1 })` |
| `toContain(item)` | `expect(items).toContain('Backpack')` |

### Synchronization Gates (Wait Without Asserting)

| Method | What it does | Use case |
|---|---|---|
| `waitFor({ state: 'visible' })` | Waits until visible, doesn't throw | Before interacting with a lazily loaded element |
| `waitForURL(regex)` | Waits until URL matches | After clicking a navigation link |
| `waitForResponse(url)` | Waits for a specific API call | Before asserting UI that depends on API data |
| `waitForLoadState('networkidle')` | Waits until no network activity for 500ms | Complex SPAs with many async requests |

---

## 6. CI/CD with GitHub Actions

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright Browsers
      run: npx playwright install --with-deps

    - name: Run Playwright tests
      run: npx playwright test

    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

### Step-by-Step Explanation

| Step | Why |
|---|---|
| `on: push / pull_request` | Triggers tests on every commit and PR to main/master |
| `timeout-minutes: 60` | Hard cap — if tests hang, GitHub kills the job instead of burning runner minutes |
| `runs-on: ubuntu-latest` | Ubuntu CI runner; Playwright tests need a real OS for browser binaries |
| `npm ci` | Like `npm install` but faster and stricter (uses lockfile, wipes node_modules first) |
| `npx playwright install --with-deps` | `--with-deps` installs system libraries (`libgtk`, `libnss3`, etc.) needed to run Chromium/Firefox on Ubuntu. Without this, browsers crash. |
| `npx playwright test` | Runs all tests. Uses the `playwright.config.ts` in the repo. |
| `if: ${{ !cancelled() }}` | Uploads the report even if tests fail (but skips on manual cancellation) |
| `retention-days: 30` | Keeps the artifact for 30 days so you can download and inspect failures |
