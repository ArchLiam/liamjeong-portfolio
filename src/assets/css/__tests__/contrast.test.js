// Contrast budget for the site's colour pairs, read straight from site.css so a
// palette or opacity change can't quietly drop below WCAG 2.2 AA:
// 4.5:1 for text (1.4.3) and 3:1 for graphics and states that carry meaning (1.4.11).
// When adding a colour pair to the CSS, add it here too.
import { readFileSync } from 'fs';
import { join } from 'path';

const css = readFileSync(join(__dirname, '..', 'site.css'), 'utf8');

const tokens = Object.fromEntries(
    [...css.matchAll(/--lj-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(
        ([, name, hex]) => [name, hex]
    )
);

// The value of `property` in the rules for `selector` (a selector can head
// several rules, e.g. one grouped with others and one on its own)
const ruleValue = (selector, property) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blocks = [
        ...css.matchAll(new RegExp(`(^|\\n)${escaped}\\s*\\{([^}]*)\\}`, 'g'))
    ];
    if (!blocks.length) {
        throw new Error(`no rule for ${selector} in site.css`);
    }
    for (const block of blocks) {
        const value = block[2].match(
            new RegExp(`(^|[\\s;])${property}:\\s*([^;]+);`)
        );
        if (value) {
            return value[2].trim();
        }
    }
    throw new Error(`${selector} sets no ${property}`);
};

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const luminance = (hex) => {
    const [r, g, b] = rgb(hex).map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
};

// A colour drawn at `alpha` opacity over a background, as the browser shows it
const over = (hex, alpha, background) => {
    const fg = rgb(hex);
    const bg = rgb(background);
    return `#${fg
        .map((v, i) => Math.round(alpha * v + (1 - alpha) * bg[i]))
        .map((v) => v.toString(16).padStart(2, '0'))
        .join('')}`;
};

const t = (name) => {
    if (!tokens[name]) {
        throw new Error(`--lj-${name} is not defined in site.css`);
    }
    return tokens[name];
};

describe('colour contrast (WCAG 2.2 AA)', () => {
    const text = [
        ['body text and headings', 'ink', 'paper'],
        [
            'secondary text, nav, diagram hint, certification counts',
            'slate',
            'paper'
        ],
        [
            'secondary text on white sections and cards, credential IDs and dates',
            'slate',
            'surface'
        ],
        ['card labels', 'ink', 'surface'],
        [
            'links, the light lockup role, project program names',
            'brand',
            'paper'
        ],
        ['links on hover', 'brand-deep', 'paper'],
        [
            'contact heading and links, footer name, quotes, badge names',
            'paper',
            'ink'
        ],
        ['brand button text', 'surface', 'ink'],
        [
            'contact text, footer links, recommendations lede, badge details',
            'on-ink',
            'ink'
        ],
        [
            'footer text, lockup domain, recommender titles',
            'on-ink-muted',
            'ink'
        ],
        [
            'dark lockup role, LinkedIn link, quote counter, profile link',
            'on-ink-accent',
            'ink'
        ],
        ['initials avatars', 'surface', 'brand'],
        ['honors on white sections', 'brand', 'surface'],
        ['recommender initials', 'ink', 'on-ink-accent']
    ];

    it.each(text)('text: %s (%s on %s) is at least 4.5:1', (_, fg, bg) => {
        expect(contrast(t(fg), t(bg))).toBeGreaterThanOrEqual(4.5);
    });

    const graphics = [
        ['diagram ports and icon chips', () => [t('brand'), t('paper')]],
        ['icon chips on white cards', () => [t('brand'), t('surface')]],
        ['focus ring, outer ink edge', () => [t('ink'), t('paper')]],
        ['focus ring, amber on dark sections', () => [t('signal'), t('ink')]],
        ['selected-card dot ring', () => [t('ink'), t('surface')]],
        ['selected recommender ring', () => [t('on-ink-accent'), t('ink')]],
        ['previous/next chevrons', () => [t('paper'), t('ink')]],
        ['previous/next button edges', () => [t('on-ink-muted'), t('ink')]],
        [
            'diagram connectors',
            () => [
                over(
                    t('brand'),
                    Number(ruleValue('.schema-edge', 'stroke-opacity')),
                    t('paper')
                ),
                t('paper')
            ]
        ],
        [
            'stepped-back connectors while a card is selected',
            () => [
                over(
                    t('brand'),
                    Number(ruleValue('.schema-edge_dim', 'stroke-opacity')),
                    t('paper')
                ),
                t('paper')
            ]
        ],
        [
            'stepped-back ports while a card is selected',
            () => [
                over(
                    t('brand'),
                    Number(ruleValue('.schema-port_dim', 'stroke-opacity')),
                    t('paper')
                ),
                t('paper')
            ]
        ]
    ];

    it.each(graphics)('graphic: %s is at least 3:1', (_, pair) => {
        const [fg, bg] = pair();
        expect(contrast(fg, bg)).toBeGreaterThanOrEqual(3);
    });

    it('marks the selected recommender with the accent ring', () => {
        expect(
            ruleValue('.recommendations__tab_active', 'box-shadow')
        ).toContain('var(--lj-on-ink-accent)');
    });

    it('marks the selected card with the ink-ringed dot, not amber alone', () => {
        expect(ruleValue('.schema-node__signal', 'stroke')).toBe(
            'var(--lj-ink)'
        );
    });
});
