# liamjeong.com

Source for [liamjeong.com](https://liamjeong.com), the portfolio of Liam (LJ) Jeong, Salesforce Architect.

Built with [Lightning Web Components (open source)](https://lwc.dev) on [Lightning Web Runtime](https://developer.salesforce.com/docs/platform/lwr/overview), styled with the [Salesforce Lightning Design System](https://www.lightningdesignsystem.com), animated with [GSAP](https://gsap.com), and deployed as a static site to Vercel's edge network.

## Run it locally

Requires Node 22.

```bash
npm install
npm run dev        # local server at http://localhost:3000 (restart after edits)
npm run lint       # ESLint with the LWC rules
npm test           # Jest unit tests, including axe accessibility checks
npm run build      # static production build into ./site
npm run preview    # serve ./site locally to check the production build
```

## How it's put together

```
src/
├── layouts/main.html          Page shell: meta tags, fonts, SLDS + site CSS
├── content/home.html          Home route body: the hydrated root component
├── assets/
│   ├── css/site.css           Design tokens, SLDS styling hooks, layout
│   └── images/favicon.svg
└── modules/lj/
    ├── app/                   Root component: header, proof points, contact, footer
    ├── hero/                  Name, positioning, animated schema diagram
    ├── work/                  Case studies as native <details> rows
    ├── experience/            Timeline and credentials
    └── content/               All copy and data in one module
```

Design decisions worth knowing:

- **Light DOM throughout.** Off-platform LWC uses native shadow DOM, which blocks the global SLDS stylesheet. Page-level components opt into `static renderMode = 'light'` so SLDS classes and the site tokens apply normally.
- **Server-side rendered at build time.** The home route sets `bootstrap.ssr: true`, so `lwr build` writes real HTML for search engines and link previews. Browser-only code (GSAP, `window`) lives in `renderedCallback`, which never runs on the server. The root component is marked `lwr:hydrate` so the page becomes interactive after load. LWR SSR is a developer preview that supports AMD modules only, so builds run in `prod-compat` mode, and a post-build check fails the build if the page didn't render.
- **One motion moment.** The hero diagram draws itself once on load. It respects `prefers-reduced-motion`, and a CSS fallback reveals everything if JavaScript never runs.
- **Content is data.** Edit `src/modules/lj/content/content.js` to change copy. Items marked `TODO` or `DRAFT` are placeholders.

## Deploy

Vercel builds from `main` using `vercel.json` (`npm run build`, output `site`). Every other branch gets a preview URL.
