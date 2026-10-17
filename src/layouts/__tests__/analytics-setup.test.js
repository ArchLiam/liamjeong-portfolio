// The Umami tracker is set up in two places that must agree: the layout loads
// it, and the security policy in vercel.json has to allow both its script and
// the address it sends to (read from the tracker itself: gateway.umami.is).
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..', '..');
const layout = readFileSync(join(root, 'src/layouts/main.html'), 'utf8');
const csp = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'))
    .headers.flatMap((rule) => rule.headers)
    .find((header) => /^Content-Security-Policy/.test(header.key)).value;
const directive = (name) =>
    csp
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name} `)) || '';

describe('analytics setup', () => {
    const tag = (layout.match(/<script[^>]*cloud\.umami\.is[^>]*>/) || [''])[0];

    it('loads the Umami tracker in the layout, deferred', () => {
        expect(tag).toMatch(/src="https:\/\/cloud\.umami\.is\/script\.js"/);
        expect(tag).toMatch(/\bdefer\b/);
        expect(tag).toMatch(/data-website-id="[0-9a-f-]{36}"/);
    });

    // Without this, dev, CI, and Vercel preview visits would count
    it('counts only visits to liamjeong.com', () => {
        expect(tag).toMatch(/data-domains="liamjeong\.com"/);
    });

    it("honours the browser's Do Not Track setting", () => {
        expect(tag).toMatch(/data-do-not-track="true"/);
    });

    it('is allowed by the security policy', () => {
        expect(directive('script-src')).toContain('https://cloud.umami.is');
        expect(directive('connect-src')).toContain('https://gateway.umami.is');
    });
});
