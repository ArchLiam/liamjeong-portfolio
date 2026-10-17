# liamjeong.com

Source for [liamjeong.com](https://liamjeong.com), the portfolio of Liam (LJ) Jeong, Salesforce Architect.

Built with [Lightning Web Components (open source)](https://lwc.dev) on [Lightning Web Runtime](https://developer.salesforce.com/docs/platform/lwr/overview), styled with the [Salesforce Lightning Design System](https://www.lightningdesignsystem.com), animated with [GSAP](https://gsap.com), and deployed as a static site to Vercel's edge network.

## Run it locally

Requires Node 22.

```bash
npm install
npm run dev        # local server at http://localhost:3000 (restart after edits)
npm run lint       # ESLint with the LWC rules
npm test           # Jest unit tests, including axe and colour-contrast checks
npm run test:a11y   # after a build: WCAG 2.2 AA audit of the page in headless Chrome
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
│   ├── logo/                  Logo marks, favicons, app icons, link-preview image
│   ├── img/                   Photos, headshots, issuer, company, and school logos, badges
│   └── site.webmanifest       Home-screen icons for Android
└── modules/lj/
    ├── app/                   Root component: header, contact, footer
    ├── hero/                  Lockup, positioning, animated schema diagram
    ├── icons/                 SLDS utility icon paths for the diagram (CC BY-ND 4.0)
    ├── lockup/                Logo lockup (mark, name, role), light and dark
    ├── recommendations/       LinkedIn recommendation excerpts, one at a time (spotlight with avatar tabs)
    ├── projects/              Projects as native <details> rows that fold open
    ├── experience/            Career timeline with company logos
    ├── education/             Schools and degrees
    ├── certifications/        Trailhead badges, then certifications, one card per issuer
    └── content/               All copy and data (recommendations and certifications in their own files)
```

Design decisions worth knowing:

- **Light DOM throughout.** Off-platform LWC uses native shadow DOM, which blocks the global SLDS stylesheet. Page-level components opt into `static renderMode = 'light'` so SLDS classes and the site tokens apply normally.
- **Server-side rendered at build time.** The home route sets `bootstrap.ssr: true`, so `lwr build` writes real HTML for search engines and link previews. Browser-only code (GSAP, `window`) lives in `renderedCallback`, which never runs on the server. The root component is marked `lwr:hydrate` so the page becomes interactive after load. LWR SSR is a developer preview that supports AMD modules only, so builds run in `prod-compat` mode, and a post-build check fails the build if the page didn't render.
- **One motion moment.** The hero diagram, a Schema Builder-style map with SLDS icons, assembles itself once on load: cards fly out of the platform core, connectors draw, data pulses travel along them, and the last one runs from Data 360 into Agentforce. It finishes in under five seconds, respects `prefers-reduced-motion`, and a CSS fallback reveals everything if JavaScript never runs. Afterwards each card is a button: tapping, clicking, or pressing Enter on one moves the highlight to it, traces its connections, and names them in a caption that screen readers also hear.
- **Content is data.** Edit `src/modules/lj/content/content.js` to change copy. Items marked `TODO` or `DRAFT` are placeholders.

## Accessibility

The site is built to [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA, and CI enforces it on every push:

- **Component tests** run axe-core on each rendered component.
- **A contrast budget** reads the colour tokens from `site.css` and fails if text drops below 4.5:1 or a meaningful graphic below 3:1.
- **A page-level audit** (`scripts/a11y-check.js`) runs axe-core's WCAG 2.0, 2.1, and 2.2 A/AA rules on the built page in headless Chrome at desktop width, with a diagram card selected, with another recommendation shown, at 200% zoom, and at 320px, and checks that nothing scrolls sideways.

The hero diagram is keyboard and screen reader operable: each card is a button with its items in its name, selection is announced, and motion respects `prefers-reduced-motion` and finishes within five seconds.

Automated checks catch roughly a third of WCAG issues, so changes that affect structure or interaction also get a manual pass: a screen reader (VoiceOver or NVDA), keyboard only, 200% zoom, and the text-spacing override.

## Deploy

Vercel builds from `main` using `vercel.json` (`npm run build`, output `site`). Every other branch gets a preview URL.

## Credits

The hero diagram's icons are Salesforce Lightning Design System utility icons
(`agent_astro`, `apex`, `data_cloud`, `data_mapping`, `integration`, `merge`,
`touch_action`), © Salesforce, Inc., from
[`@salesforce-ux/design-system`](https://github.com/salesforce-ux/design-system).
They are used unmodified under the
[Creative Commons Attribution-NoDerivatives 4.0 International license](https://creativecommons.org/licenses/by-nd/4.0/).
The site footer links here through "View the source."

The Salesforce and Copado logos in the Certifications section are trademarks
of Salesforce, Inc. and Copado, Inc. They appear only to identify who issued
each certification. The Trailhead badge images (All Star Ranger, Agentblazer
Legend) are © Salesforce, Inc. and are shown as earned. The company logos in
the Experience section and the university seal in the Education section are
trademarks of their owners, shown only to identify past employers and the
school. This site is not affiliated with or endorsed by any of these
companies.
