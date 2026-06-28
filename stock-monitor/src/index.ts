import { chromium, type Browser, type Page } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

interface ProductSelectors {
  title?: string;
  price?: string;
  stock?: string;
}

interface Product {
  retailer: string;
  model: string;
  url: string;
  maxPrice: number;
  positiveStockPhrases: string[];
  negativeStockPhrases: string[];
  selectors?: ProductSelectors;
}

interface ProductResult {
  retailer: string;
  model: string;
  url: string;
  checkedAt: string;
  title: string;
  visiblePrice: string;
  parsedPrice: number | null;
  stockStatus: string;
  hasPositiveStockPhrase: boolean;
  hasNegativeStockPhrase: boolean;
  available: boolean;
  reason: string;
}

type State = Record<string, ProductResult>;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = path.join(rootDir, 'products.json');
const statePath = path.join(rootDir, 'state.json');
const debug = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
}

function normaliseText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function includesAny(text: string, phrases: string[]): boolean {
  const lowerText = text.toLowerCase();
  return phrases.some((phrase) => lowerText.includes(phrase.toLowerCase()));
}

function parsePrice(text: string): number | null {
  const match = text.replace(/,/g, '').match(/(?:£|gbp\s*)\s*(\d+(?:\.\d{1,2})?)/i);
  return match ? Number.parseFloat(match[1]) : null;
}

async function textFromSelector(page: Page, selector?: string): Promise<string> {
  if (!selector) return '';
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) return '';
  return normaliseText((await locator.innerText({ timeout: 3000 }).catch(() => '')) ?? '');
}

async function checkProduct(page: Page, product: Product): Promise<ProductResult> {
  await page.goto(product.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(1500 + Math.floor(Math.random() * 1500));

  const pageText = normaliseText(await page.locator('body').innerText({ timeout: 5000 }).catch(() => ''));
  const selectedTitle = await textFromSelector(page, product.selectors?.title);
  const selectedPrice = await textFromSelector(page, product.selectors?.price);
  const selectedStock = await textFromSelector(page, product.selectors?.stock);
  const fallbackTitle = normaliseText(await page.title().catch(() => ''));

  const title = selectedTitle || fallbackTitle || product.model;
  const visiblePrice = selectedPrice || pageText;
  const parsedPrice = parsePrice(visiblePrice);
  const stockStatus = selectedStock || pageText;
  const hasNegativeStockPhrase = includesAny(pageText, product.negativeStockPhrases);
  const hasPositiveStockPhrase = includesAny(pageText, product.positiveStockPhrases);
  const priceIsBelowMax = parsedPrice !== null && parsedPrice < product.maxPrice;
  const available = priceIsBelowMax && !hasNegativeStockPhrase && hasPositiveStockPhrase;

  let reason = 'available';
  if (!priceIsBelowMax) reason = parsedPrice === null ? 'no price found' : `price £${parsedPrice.toFixed(2)} is not below £${product.maxPrice.toFixed(2)}`;
  if (hasNegativeStockPhrase) reason = 'negative stock phrase found';
  if (!hasPositiveStockPhrase) reason = 'positive stock phrase not found';

  return {
    retailer: product.retailer,
    model: product.model,
    url: product.url,
    checkedAt: new Date().toISOString(),
    title,
    visiblePrice: selectedPrice || (parsedPrice === null ? '' : `£${parsedPrice.toFixed(2)}`),
    parsedPrice,
    stockStatus: selectedStock,
    hasPositiveStockPhrase,
    hasNegativeStockPhrase,
    available,
    reason
  };
}

async function sendPushoverAlert(result: ProductResult): Promise<void> {
  const user = process.env.PUSHOVER_USER_KEY;
  const token = process.env.PUSHOVER_API_TOKEN;
  if (!user || !token) {
    console.warn(`Pushover credentials missing; alert skipped for ${result.retailer} ${result.model}.`);
    return;
  }

  const response = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      user,
      title: `Portable AC available: ${result.model}`,
      message: `${result.retailer}: ${result.title}\nPrice: ${result.visiblePrice || 'unknown'}\n${result.url}`,
      url: result.url,
      url_title: 'Open product page',
      priority: 0
    })
  });

  if (!response.ok) {
    throw new Error(`Pushover alert failed (${response.status}): ${await response.text()}`);
  }
}

async function run(): Promise<void> {
  const products = await readJsonFile<Product[]>(productsPath, []);
  const previousState = await readJsonFile<State>(statePath, {});
  const nextState: State = { ...previousState };
  let browser: Browser | undefined;

  if (products.length === 0) {
    console.log('No products configured in products.json.');
    return;
  }

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      locale: 'en-GB',
      timezoneId: 'Europe/London',
      userAgent: 'Mozilla/5.0 (compatible; stock-monitor/1.0; +https://github.com/)'
    });

    for (const product of products) {
      const page = await context.newPage();
      const key = `${product.retailer}:${product.model}:${product.url}`;
      try {
        const result = await checkProduct(page, product);
        const wasAvailable = previousState[key]?.available === true;
        nextState[key] = result;
        console.log(`${result.available ? 'AVAILABLE' : 'unavailable'} - ${product.retailer} ${product.model}: ${result.reason}`);
        if (debug) console.log(JSON.stringify(result, null, 2));
        if (result.available && !wasAvailable) {
          await sendPushoverAlert(result);
        }
      } catch (error) {
        console.error(`Failed to check ${product.retailer} ${product.model}:`, error);
        nextState[key] = {
          retailer: product.retailer,
          model: product.model,
          url: product.url,
          checkedAt: new Date().toISOString(),
          title: product.model,
          visiblePrice: '',
          parsedPrice: null,
          stockStatus: '',
          hasPositiveStockPhrase: false,
          hasNegativeStockPhrase: false,
          available: false,
          reason: `check failed: ${(error as Error).message}`
        };
      } finally {
        await page.close().catch(() => undefined);
        await new Promise((resolve) => setTimeout(resolve, 3000 + Math.floor(Math.random() * 2000)));
      }
    }
  } finally {
    await browser?.close();
    await writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`);
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
