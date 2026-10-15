/**
 * Runs after `lwr build` (npm's postbuild hook), against the static output in ./site.
 *
 * 1. Fails the build when server-side rendering did not produce the page. When SSR
 *    fails, LWR writes the error message as index.html and still exits 0, which
 *    would deploy a broken home page behind a green build.
 * 2. Rewrites script URLs from LWR's encoded form (lwc%2Fv%2F9_5_1) to the decoded
 *    paths the files are written at (lwc/v/9_5_1). LWR's own fix for this is a
 *    Netlify _redirects file and a serve.json, and Vercel reads neither. Static
 *    hosts that keep %2F encoded would otherwise 404 every script.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const SITE_DIR = 'site';
const PAGE = `${SITE_DIR}/index.html`;

const fail = (message) => {
    console.error(`postbuild: ${message}`);
    process.exit(1);
};

const html = readFileSync(PAGE, 'utf8');

// The root component must have server-rendered children, not be empty or missing.
if (!/<lj-app\b[^>]*>\s*<(?!\/)/.test(html)) {
    fail(
        `${PAGE} has no server-rendered <lj-app>. It starts with:\n${html.slice(0, 300)}`
    );
}

let rewritten = 0;
const output = html.replace(
    /(<script\b[^>]*\bsrc=")([^"]+)"/g,
    (match, start, src) => {
        const decoded = decodeURIComponent(src);
        if (!existsSync(`${SITE_DIR}${decoded}`)) {
            fail(`script ${src} has no file at ${SITE_DIR}${decoded}`);
        }
        if (decoded !== src) {
            rewritten += 1;
        }
        return `${start}${decoded}"`;
    }
);

writeFileSync(PAGE, output);
console.log(
    `postbuild: SSR output present; ${rewritten} script URL(s) decoded.`
);
