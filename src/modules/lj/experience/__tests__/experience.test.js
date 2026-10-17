import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'lwc';
import Experience from 'lj/experience';
import { experience } from 'lj/content';

const render = () => {
    const element = createElement('lj-experience', { is: Experience });
    document.body.appendChild(element);
    return element;
};

// The text a screen reader reads: aria-hidden parts (the initials tile) left out
const spoken = (node) => {
    const copy = node.cloneNode(true);
    copy.querySelectorAll('[aria-hidden="true"]').forEach((hidden) =>
        hidden.remove()
    );
    return copy.textContent.replace(/\s+/g, ' ').trim();
};

const itemsOf = (element) => [...element.querySelectorAll('.timeline__item')];

describe('lj-experience', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('content', () => {
        it('gives every role without a logo initials to show instead', () => {
            expect(
                experience
                    .filter((item) => !item.logo && !item.initials)
                    .map((item) => item.id)
            ).toEqual([]);
        });

        it('points every logo at a file that exists', () => {
            const missing = experience
                .filter((item) => item.logo)
                // "/assets/..." is served from src/assets; __dirname is four levels below src
                .filter(
                    (item) =>
                        !existsSync(join(__dirname, '../../../..', item.logo))
                )
                .map((item) => item.logo);
            expect(missing).toEqual([]);
        });
    });

    it('renders the timeline in content order', () => {
        const element = render();

        const orgs = [...element.querySelectorAll('.timeline__org')].map(
            (node) => node.textContent.trim()
        );
        expect(orgs).toEqual(experience.map((role) => role.org));
    });

    it('reads each role as separate words: years, company, title, detail', () => {
        const element = render();

        itemsOf(element).forEach((item, i) => {
            const { period, org, title, detail } = experience[i];
            expect(spoken(item)).toBe(
                [period, org, title, detail].filter(Boolean).join(' ')
            );
        });
    });

    it('leaves out years and a detail that are unknown', () => {
        const element = render();

        itemsOf(element).forEach((item, i) => {
            const { period, detail } = experience[i];
            expect([
                Boolean(item.querySelector('.timeline__period')),
                Boolean(item.querySelector('.timeline__detail'))
            ]).toEqual([Boolean(period), Boolean(detail)]);
        });
    });

    it('shows each logo as a decorative image', () => {
        const element = render();

        const withLogo = experience.filter((item) => item.logo);
        expect(withLogo.length).toBeGreaterThan(0);
        withLogo.forEach((role) => {
            const img =
                itemsOf(element)[experience.indexOf(role)].querySelector(
                    'img.timeline__logo'
                );
            expect(img.getAttribute('src')).toBe(role.logo);
            expect(img.getAttribute('alt')).toBe('');
        });
    });

    // Every current role has a logo, so this blanks one to cover the fallback
    it('shows hidden initials when a role has no logo', () => {
        const role = experience[0];
        const saved = { logo: role.logo, initials: role.initials };
        role.logo = '';
        role.initials = 'XY';
        try {
            const element = render();

            const item = itemsOf(element)[0];
            const tile = item.querySelector('.timeline__logo_initials');
            expect(item.querySelector('img')).toBeNull();
            expect(tile.getAttribute('aria-hidden')).toBe('true');
            expect(tile.textContent).toBe('XY');
            expect(spoken(item)).not.toContain('XY');
        } finally {
            Object.assign(role, saved);
            if (saved.initials === undefined) {
                delete role.initials;
            }
        }
    });

    it('keeps list semantics on the timeline', () => {
        const element = render();

        expect(element.querySelector('ol.timeline').getAttribute('role')).toBe(
            'list'
        );
    });

    it('is accessible', async () => {
        const element = render();

        await expect(element).toBeAccessible();
    });
});
