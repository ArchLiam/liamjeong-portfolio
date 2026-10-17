/**
 * Page-level WCAG 2.2 AA check of the built site. Run after `npm run build`
 * (`npm run test:a11y`); CI runs it on every push.
 *
 * Serves ./site, opens it in headless Chrome, and fails when:
 *  - axe-core finds a WCAG 2.0, 2.1, or 2.2 A/AA violation. It checks the page
 *    at desktop and phone widths with every project open, and again with a
 *    diagram card selected and with another recommendation shown, so the
 *    interactive states are covered too.
 *  - the page scrolls sideways at 320px or 640px wide (Reflow, 1.4.10; 640px
 *    is a 1280px screen at 200% zoom).
 *  - any image renders under 8px wide, which means a layout rule squeezed it.
 *
 * axe covers roughly a third of WCAG. The colour tokens are checked by
 * src/assets/css/__tests__/contrast.test.js; the rest needs a person (see
 * the Accessibility section of the README).
 *
 * Chrome: CHROME_PATH if set, else the usual macOS and Linux install paths.
 */
/* global document, axe */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { extname, join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const SITE = resolve('site');
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.webmanifest': 'application/manifest+json'
};
const CHROME_PATHS = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
].filter(Boolean);

const fail = (message) => {
    console.error(`a11y-check: ${message}`);
    process.exit(1);
};

if (!existsSync(join(SITE, 'index.html'))) {
    fail('no site/index.html; run `npm run build` first');
}
const chrome = CHROME_PATHS.find((path) => existsSync(path));
if (!chrome) {
    fail(
        `no Chrome found; set CHROME_PATH. Looked in:\n  ${CHROME_PATHS.join('\n  ')}`
    );
}
const axeSource = readFileSync(
    createRequire(import.meta.url).resolve('axe-core/axe.min.js'),
    'utf8'
);

// A plain static server for ./site (no CSP header, so axe can be injected)
const server = createServer((req, res) => {
    let file = join(
        SITE,
        decodeURIComponent(new URL(req.url, 'http://x').pathname)
    );
    if (!file.startsWith(SITE)) {
        res.writeHead(400).end();
        return;
    }
    if (existsSync(file) && statSync(file).isDirectory()) {
        file = join(file, 'index.html');
    }
    if (!existsSync(file)) {
        res.writeHead(404).end();
        return;
    }
    res.writeHead(200, {
        'Content-Type': TYPES[extname(file)] || 'application/octet-stream'
    });
    res.end(readFileSync(file));
});
await new Promise((done) => server.listen(0, done));
const url = `http://localhost:${server.address().port}/`;

const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    // GitHub's Ubuntu runners block Chrome's sandbox; the page is our own build
    args: process.env.CI ? ['--no-sandbox'] : []
});

const problems = [];

async function audit({ name, width, selectCard = false, nextQuote = false }) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 900 });
    // Reduced motion: everything is visible at once, with no intro to wait for
    await page.emulateMediaFeatures([
        { name: 'prefers-reduced-motion', value: 'reduce' }
    ]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.evaluate(() =>
        document.querySelectorAll('details').forEach((d) => {
            d.open = true;
        })
    );
    if (selectCard) {
        await page.click('[data-node][data-hub]');
        await page.waitForSelector('.schema-edge_active');
    }
    if (nextQuote) {
        // Move to the photo-less recommender: the initials avatar is the case
        // most likely to break label-in-name (2.5.3)
        await page.click('.recommendations__arrow:last-child');
        await page.waitForSelector(
            '[role="tab"][aria-selected="true"] [role="img"]'
        );
    }

    await page.addScriptTag({ content: axeSource });
    const violations = await page.evaluate(async (tags) => {
        const result = await axe.run(document, {
            runOnly: { type: 'tag', values: tags }
        });
        return result.violations.map(
            (v) =>
                `${v.id} (${v.impact}): ${v.help}\n      at ${v.nodes
                    .slice(0, 3)
                    .map((n) => n.target.join(' '))
                    .join('\n      at ')}`
        );
    }, AXE_TAGS);
    violations.forEach((v) => problems.push(`[${name}] ${v}`));

    const overflow = await page.evaluate(
        () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth
    );
    if (width <= 640 && overflow > 0) {
        problems.push(
            `[${name}] reflow (1.4.10): the page scrolls ${overflow}px sideways at ${width}px wide`
        );
    }

    // A layout rule that squeezes an image's column hides it with no other
    // symptom (a stale small-screen grid rule once shrank the company logos
    // to 2px). Images in hidden panels still have a size, so this is safe.
    const collapsed = await page.evaluate(() =>
        [...document.images]
            .filter((img) => img.getBoundingClientRect().width < 8)
            .map((img) => img.getAttribute('src'))
    );
    collapsed.forEach((src) =>
        problems.push(
            `[${name}] layout: the image ${src} renders under 8px wide at ${width}px`
        )
    );

    const failed =
        violations.length || (width <= 640 && overflow > 0) || collapsed.length;
    console.log(`${failed ? 'FAIL' : 'ok  '}  ${name}`);
    await page.close();
}

try {
    await audit({ name: 'desktop 1280px', width: 1280 });
    await audit({
        name: 'desktop, diagram card selected',
        width: 1280,
        selectCard: true
    });
    await audit({
        name: 'desktop, second recommendation shown',
        width: 1280,
        nextQuote: true
    });
    await audit({ name: '200% zoom (640px)', width: 640 });
    await audit({ name: 'phone 320px', width: 320 });
} finally {
    await browser.close();
    server.close();
}

if (problems.length) {
    console.error(`\n${problems.length} accessibility problem(s):\n`);
    problems.forEach((p) => console.error(`  ${p}\n`));
    process.exit(1);
}
console.log(
    '\na11y-check: no WCAG 2.2 A/AA violations found by axe, and no reflow problems.'
);
