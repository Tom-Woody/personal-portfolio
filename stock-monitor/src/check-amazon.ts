import { chromium, type Browser, type Page } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

type AmazonStateStatus =
  | 'available'
  | 'unavailable'
  | 'price-too-high'
  | 'no-price'
  | 'captcha'
  | 'blocked'
  | 'check-failed';

interface AmazonProduct {
  name: string;
  asin?: string;
  url?: string;
  store?: string;
  maxPrice: number;
  positiveStockPhrases?: string[];
  negativeStockPhrases?: string[];
  selectors?: {
    title?: string;
    price?: string;
    stock?: string;
  };
}

interface AmazonProductResult {
  name: string;
  asin: string;
  url: string;
  checkedAt: string;
  title: string;
  visiblePrice: string;
  parsedPrice: number | null;
  stockStatus: string;
  status: AmazonStateStatus;
  reason: string;
}

type AmazonState = Record<string, AmazonProductResult>;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const productsPath = path.join(rootDir, 'amazon-products.json');
const statePath = path.join(rootDir, 'amazon-state.json');
const debug = process.env.DEBUG === '1' || process.env.DEBUG === 'true';

const defaultPositiveStockPhrases = [
  'add to basket',
  'add to cart',
  'dispatches from amazon',
  'in stock'
];

const defaultNegativeStockPhrases = [
  'currently unavailable',
  'temporarily out of stock',
  'out of stock',
  'no featured offers available'
];

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
  const matches = Array.from(text.replace(/,/g, '').matchAll(/(?:£|gbp\s*)\s*(\d+(?:\.\d{1,2})?)/gi))
    .map((match) => Number.parseFloat(match[1]))
    .filter((value) => Number.isFinite(value));
  if (matches.length === 0) return null;
  return Math.min(...matches);
}

function buildProductUrl(product: AmazonProduct): string {
  if (product.url) return product.url;
  if (!product.asin) {
    throw new Error('Each Amazon product needs either a url or an asin.');
  }

  const host = product.store?.trim() || 'www.amazon.co.uk';
  return `https://${host}/dp/${product.asin}`;
}

function productKey(product: AmazonProduct, url: string): string {
  return `${product.name}:${product.asin || url}`;
}

async function textFromSelector(page: Page, selector?: string): Promise<string> {
  if (!selector) return '';
  const locator = page.locator(selector).first();
  if ((await locator.count()) === 0) return '';
  return normaliseText((await locator.innerText({ timeout: 3000 }).catch(() => '')) ?? '');
}

function detectBlockedStatus(pageText: string, title: string): AmazonStateStatus | null {
  const combined = `${title} ${pageText}`.toLowerCase();

  if (
    combined.includes('enter the characters you see below') ||
    combined.includes('type the characters you see in this image') ||
    combined.includes('sorry, we just need to make sure you\'re not a robot')
  ) {
    return 'captcha';
  }

  if (
    combined.includes('503 service unavailable') ||
    combined.includes('access denied') ||
    combined.includes('robot check') ||
    combined.includes('automated access') ||
    combined.includes('request could not be satisfied')
  ) {
    return 'blocked';
  }

  return null;
}

async function checkAmazonProduct(page: Page, product: AmazonProduct): Promise<AmazonProductResult> {
  const url = buildProductUrl(product);
  const positiveStockPhrases = product.positiveStockPhrases ?? defaultPositiveStockPhrases;
  const negativeStockPhrases = product.negativeStockPhrases ?? defaultNegativeStockPhrases;

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(1500 + Math.floor(Math.random() * 1500));

  const pageText = normaliseText(await page.locator('body').innerText({ timeout: 5000 }).catch(() => ''));
  const selectedTitle = await textFromSelector(page, product.selectors?.title ?? '#productTitle');
  const selectedPrice = await textFromSelector(
    page,
    product.selectors?.price ?? '#corePrice_feature_div, #corePriceDisplay_desktop_feature_div, .a-price'
  );
  const selectedStock = await textFromSelector(
    page,
    product.selectors?.stock ?? '#availability, #availabilityInsideBuyBox_feature_div'
  );
  const fallbackTitle = normaliseText(await page.title().catch(() => ''));
  const title = selectedTitle || fallbackTitle || product.name;
  const blockedStatus = detectBlockedStatus(pageText, title);

  if (blockedStatus) {
    return {
      name: product.name,
      asin: product.asin ?? '',
      url,
      checkedAt: new Date().toISOString(),
      title,
      visiblePrice: '',
      parsedPrice: null,
      stockStatus: selectedStock,
      status: blockedStatus,
      reason: blockedStatus === 'captcha' ? 'Amazon served a robot check' : 'Amazon blocked the page request'
    };
  }

  const visiblePrice = selectedPrice || pageText;
  const parsedPrice = parsePrice(visiblePrice);
  const stockStatus = selectedStock || pageText;
  const hasNegativeStockPhrase = includesAny(pageText, negativeStockPhrases);
  const hasPositiveStockPhrase = includesAny(pageText, positiveStockPhrases);

  let status: AmazonStateStatus = 'available';
  let reason = 'available';

  if (hasNegativeStockPhrase) {
    status = 'unavailable';
    reason = 'negative stock phrase found';
  } else if (!hasPositiveStockPhrase) {
    status = parsedPrice === null ? 'no-price' : 'unavailable';
    reason = parsedPrice === null ? 'no price found and no positive stock phrase found' : 'positive stock phrase not found';
  } else if (parsedPrice === null) {
    status = 'no-price';
    reason = 'no price found';
  } else if (parsedPrice > product.maxPrice) {
    status = 'price-too-high';
    reason = `price £${parsedPrice.toFixed(2)} is above £${product.maxPrice.toFixed(2)}`;
  }

  return {
    name: product.name,
    asin: product.asin ?? '',
    url,
    checkedAt: new Date().toISOString(),
    title,
    visiblePrice: selectedPrice || (parsedPrice === null ? '' : `£${parsedPrice.toFixed(2)}`),
    parsedPrice,
    stockStatus,
    status,
    reason
  };
}

async function sendPushoverAlert(result: AmazonProductResult): Promise<void> {
  const user = process.env.PUSHOVER_USER_KEY;
  const token = process.env.PUSHOVER_API_TOKEN;
  if (!user || !token) {
    console.warn(`Pushover credentials missing; alert skipped for Amazon product ${result.name}.`);
    return;
  }

  const response = await fetch('https://api.pushover.net/1/messages.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      user,
      title: `Amazon available: ${result.name}`,
      message: `${result.title}\nPrice: ${result.visiblePrice || 'unknown'}\n${result.url}`,
      url: result.url,
      url_title: 'Open Amazon product page',
      priority: 0
    })
  });

  if (!response.ok) {
    throw new Error(`Pushover alert failed (${response.status}): ${await response.text()}`);
  }
}

async function run(): Promise<void> {
  const products = await readJsonFile<AmazonProduct[]>(productsPath, []);
  const previousState = await readJsonFile<AmazonState>(statePath, {});
  const nextState: AmazonState = {};
  let browser: Browser | undefined;

  if (products.length === 0) {
    console.log('No Amazon products configured in amazon-products.json.');
    await writeFile(statePath, `${JSON.stringify(nextState, null, 2)}\n`);
    return;
  }

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      locale: 'en-GB',
      timezoneId: 'Europe/London'
    });

    for (const product of products) {
      const page = await context.newPage();
      const url = buildProductUrl(product);
      const key = productKey(product, url);

      try {
        const result = await checkAmazonProduct(page, product);
        nextState[key] = result;
        const wasAvailable = previousState[key]?.status === 'available';

        console.log(`${result.status.toUpperCase()} - Amazon ${product.name}: ${result.reason}`);
        if (debug) console.log(JSON.stringify(result, null, 2));

        if (result.status === 'available' && !wasAvailable) {
          await sendPushoverAlert(result);
        }
      } catch (error) {
        nextState[key] = {
          name: product.name,
          asin: product.asin ?? '',
          url,
          checkedAt: new Date().toISOString(),
          title: product.name,
          visiblePrice: '',
          parsedPrice: null,
          stockStatus: '',
          status: 'check-failed',
          reason: `check failed: ${(error as Error).message}`
        };
        console.error(`Failed to check Amazon product ${product.name}:`, error);
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
