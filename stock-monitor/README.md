# Stock Monitor

A Node.js TypeScript Playwright monitor for UK portable air conditioner product pages. It checks configured product pages and sends a Pushover alert only when a product changes from unavailable to genuinely available under its configured maximum price.

## Important usage policy

This monitor must not be used to bypass CAPTCHAs, logins, paywalls, bot protection, queueing systems, or retailer security controls. Configure only public product pages you are allowed to access. The checker uses short delays between pages; keep the product list small and the schedule reasonable so retailers are not hammered.

## Requirements

- Node.js 20+
- npm
- A Pushover account, user key, and application API token

## Install

```bash
npm install
npx playwright install --with-deps chromium
```

## Configure products

Edit `products.json`. Each product must include:

- `retailer`: Human-readable retailer name.
- `model`: Human-readable model/product name.
- `url`: Public product page URL.
- `maxPrice`: Alert only when the parsed page price is below this number.
- `positiveStockPhrases`: Phrases that imply availability, for example `add to basket`, `add to trolley`, `available for delivery`, or `click and collect`.
- `negativeStockPhrases`: Phrases that imply unavailability, for example `out of stock`, `sold out`, `unavailable`, `no longer available`, or `preorder`.
- `selectors` (optional): CSS selectors for `title`, `price`, and `stock` text. Use these to make extraction more precise for a retailer page.
- `postcode` (optional): Postcode value to reuse in retailer availability checks.
- `setupSteps` (optional): Pre-check actions for pages that need a postcode or UI interaction before stock text appears.

Example:

```json
[
  {
    "retailer": "Example Retailer",
    "model": "Example portable air conditioner",
    "url": "https://www.example.com/product/example-portable-air-conditioner",
    "maxPrice": 400,
    "postcode": "B60 2LY",
    "positiveStockPhrases": ["add to basket", "available for delivery"],
    "negativeStockPhrases": ["out of stock", "sold out", "preorder"],
    "selectors": {
      "title": "h1",
      "price": ".price",
      "stock": ".stock-status"
    },
    "setupSteps": [
      { "action": "click", "selector": "[data-testid='delivery-options'] button" },
      { "action": "fill", "selector": "input[name='postcode']", "value": "{{postcode}}" },
      { "action": "press", "selector": "input[name='postcode']", "value": "Enter" }
    ]
  }
]
```

## Configure Pushover

Set these environment variables before running the monitor:

```bash
export PUSHOVER_USER_KEY="your-pushover-user-key"
export PUSHOVER_API_TOKEN="your-pushover-application-token"
export DELIVERY_POSTCODE="B60 2LY"
```

If either variable is missing, checks still run and `state.json` is updated, but alerts are skipped with a warning.
If `DELIVERY_POSTCODE` is set, any `setupSteps` that use `{{postcode}}` will substitute that value automatically unless a product sets its own `postcode`.

## Run locally

```bash
npm run check
```

For verbose per-product output:

```bash
npm run check:debug
```

## Amazon watchlist

Use `amazon-products.json` for individual Amazon product pages you already know you want to watch. This checker does not survey Amazon search results and does not try to bypass CAPTCHAs or blocked pages. If Amazon serves a robot check or blocked response, the saved status will be `captcha` or `blocked`.

Each Amazon item can use either a direct `url` or an `asin` plus optional `store` host:

```json
[
  {
    "name": "Example Amazon portable air conditioner",
    "asin": "B000000000",
    "store": "www.amazon.co.uk",
    "maxPrice": 400
  }
]
```

Run it with:

```bash
npm run check:amazon
```

For verbose Amazon output:

```bash
npm run check:amazon:debug
```

Results are written to `amazon-state.json`.

## How availability is decided

A product is treated as available only when all of these are true:

1. A visible price is found and is below `maxPrice`.
2. The page text does not contain any configured negative stock phrase.
3. The page text contains at least one configured positive stock phrase.

The monitor extracts the page body text, product title, visible price, and stock status. It writes the latest result for each product to `state.json`.

## Alert behaviour

Alerts are transition-based. A Pushover notification is sent only when a product changes from unavailable to available. Repeated runs do not keep alerting for the same already-available product unless it first becomes unavailable in a saved state and later becomes available again.

## GitHub Actions setup

The workflow in `.github/workflows/stock-monitor.yml` runs on a schedule and can be started manually from the GitHub Actions tab.

Add these repository secrets:

- `PUSHOVER_USER_KEY`
- `PUSHOVER_API_TOKEN`

The workflow installs dependencies, installs Chromium for Playwright, runs `npm run check`, and uploads `state.json` as an artifact for inspection.
