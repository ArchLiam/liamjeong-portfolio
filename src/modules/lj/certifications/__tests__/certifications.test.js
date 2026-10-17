import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'lwc';
import Certifications from 'lj/certifications';
import { badges, certifications, ui } from 'lj/content';

const render = () => {
    const element = createElement('lj-certifications', {
        is: Certifications
    });
    document.body.appendChild(element);
    return element;
};

const all = certifications.flatMap((group) => group.items);
const groupsOf = (element) => [
    ...element.querySelectorAll('.certifications__group')
];
const rowsOf = (element) => [...element.querySelectorAll('.certification')];
const words = (node) => node.textContent.replace(/\s+/g, ' ').trim();

// An independent formatter to check the component's month labels against
const expectedDate = (issued) =>
    new Date(`${issued}-01T00:00:00Z`).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    });

describe('lj-certifications', () => {
    const first = certifications[0].items[0];
    const saved = { ...first };
    const savedProfileUrl = ui.certifications.profileUrl;

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        Object.keys(first).forEach((key) => delete first[key]);
        Object.assign(first, saved);
        ui.certifications.profileUrl = savedProfileUrl;
    });

    describe('content', () => {
        it('gives every certification a unique id', () => {
            const ids = all.map((cert) => cert.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('stores issue dates as year-month, or empty when unknown', () => {
            const bad = all
                .filter(
                    (cert) =>
                        cert.issued !== '' &&
                        !/^\d{4}-(0[1-9]|1[0-2])$/.test(cert.issued)
                )
                .map((cert) => cert.id);
            expect(bad).toEqual([]);
        });

        it.each(certifications.map((group) => [group.issuer, group]))(
            'lists %s newest first, with undated entries last',
            (_, group) => {
                const dated = group.items.filter((cert) => cert.issued);
                const undated = group.items.filter((cert) => !cert.issued);

                expect(group.items).toEqual([...dated, ...undated]);
                expect(dated.map((cert) => cert.issued)).toEqual(
                    dated
                        .map((cert) => cert.issued)
                        .sort()
                        .reverse()
                );
            }
        );
    });

    it('renders one card per issuer, headed by the issuer and its count', () => {
        const element = render();

        expect(
            groupsOf(element).map((group) => [
                group.querySelector('h3').textContent.trim(),
                group.querySelector('.certifications__count').textContent
            ])
        ).toEqual(
            certifications.map((group) => [
                group.issuer,
                String(group.items.length)
            ])
        );
    });

    it('shows each issuer logo as a decorative image beside its name', () => {
        const element = render();

        groupsOf(element).forEach((group, i) => {
            const { logo } = certifications[i];
            const img = group.querySelector('h3 img');
            expect(img.getAttribute('src')).toBe(logo.src);
            expect(img.getAttribute('alt')).toBe('');
            expect([
                img.getAttribute('width'),
                img.getAttribute('height')
            ]).toEqual([String(logo.width), String(logo.height)]);
        });
    });

    it('points every issuer logo at a file that exists', () => {
        const missing = certifications
            .map((group) => group.logo.src)
            // "/assets/..." is served from src/assets; __dirname is four levels below src
            .filter((src) => !existsSync(join(__dirname, '../../../..', src)));
        expect(missing).toEqual([]);
    });

    it('hides the count from screen readers, since the list announces it', () => {
        const element = render();

        groupsOf(element).forEach((group) => {
            expect(
                group
                    .querySelector('.certifications__count')
                    .getAttribute('aria-hidden')
            ).toBe('true');
        });
    });

    it('names each list after its issuer and keeps list semantics', () => {
        const element = render();

        groupsOf(element).forEach((group) => {
            const list = group.querySelector('ul');
            expect(list.getAttribute('role')).toBe('list');
            expect(list.getAttribute('aria-labelledby')).toBe(
                group.querySelector('h3').id
            );
        });
    });

    it('renders every certification in content order', () => {
        const element = render();

        expect(
            rowsOf(element).map((row) =>
                words(row.querySelector('.certification__name'))
            )
        ).toEqual(all.map((cert) => cert.name));
    });

    // "Developer I" and "II: SFP" stay together, so a narrow card never ends
    // a name with a lone "I" or "SFP" on its own line
    it('never lets a short last word wrap alone', () => {
        const element = render();
        const tails = rowsOf(element).map((row) =>
            row
                .querySelector('.certification__name')
                .textContent.trim()
                .split(' ')
                .pop()
        );

        expect(tails.filter((tail) => tail.length <= 3)).toEqual([]);
    });

    it('shows each issue date as a month and year in a <time> element', () => {
        const element = render();
        const dated = all.filter((cert) => cert.issued);

        expect(dated.length).toBeGreaterThan(0);
        expect(
            [...element.querySelectorAll('.certification time')].map((time) => [
                time.getAttribute('datetime'),
                time.textContent
            ])
        ).toEqual(
            dated.map((cert) => [cert.issued, expectedDate(cert.issued)])
        );
    });

    it('reads each row as separate words: name, credential ID, issue date', () => {
        const element = render();

        expect(words(rowsOf(element)[0])).toBe(
            `${first.name} ${ui.certifications.idLabel} ${first.credentialId} ${ui.certifications.issuedLabel} ${expectedDate(first.issued)}`
        );
    });

    it('leaves out an unknown date and credential ID', () => {
        first.issued = '';
        first.credentialId = '';
        const element = render();

        const row = rowsOf(element)[0];
        expect(row.querySelector('time')).toBeNull();
        expect(row.querySelector('.certification__id')).toBeNull();
        expect(words(row)).toBe(first.name);
    });

    it('links a name to its credential once a URL exists', () => {
        const element = render();
        expect(rowsOf(element)[0].querySelector('a')).toBeNull();
        document.body.removeChild(element);

        first.url = 'https://www.linkedin.com/example-credential';
        const linked = render();

        const link = rowsOf(linked)[0].querySelector('.certification__name a');
        expect(link.getAttribute('href')).toBe(first.url);
        expect(words(link)).toBe(first.name);
    });

    it('links to the full list on LinkedIn', () => {
        const element = render();

        const link = element.querySelector('.certifications__more a');
        expect(link.getAttribute('href')).toBe(ui.certifications.allUrl);
        expect(link.textContent).toBe(ui.certifications.allLabel);
    });

    describe('Trailhead badges', () => {
        const badgesOf = (element) => [...element.querySelectorAll('.badge')];

        it('come first, before the certification cards', () => {
            const element = render();

            const panel = element.querySelector('.badges');
            const firstCard = element.querySelector('.certifications__group');
            expect(
                panel.compareDocumentPosition(firstCard) &
                    Node.DOCUMENT_POSITION_FOLLOWING
            ).toBeTruthy();
        });

        it('sit in a list named by the panel heading', () => {
            const element = render();

            const heading = element.querySelector('.badges__title');
            const list = element.querySelector('.badges__list');
            expect(heading.textContent.trim()).toBe(
                ui.certifications.badgesTitle
            );
            expect(list.getAttribute('role')).toBe('list');
            expect(list.getAttribute('aria-labelledby')).toBe(heading.id);
        });

        it('read as name then detail, in content order', () => {
            const element = render();

            expect(badgesOf(element).map(words)).toEqual(
                badges.map((badge) => `${badge.name} ${badge.detail}`)
            );
        });

        it('show each badge image as decorative, at its display size', () => {
            const element = render();

            badgesOf(element).forEach((node, i) => {
                const { image } = badges[i];
                const img = node.querySelector('img');
                expect(img.getAttribute('src')).toBe(image.src);
                expect(img.getAttribute('alt')).toBe('');
                expect([
                    img.getAttribute('width'),
                    img.getAttribute('height')
                ]).toEqual([String(image.width), String(image.height)]);
            });
        });

        it('point every badge image at a file that exists', () => {
            const missing = badges
                .map((badge) => badge.image.src)
                // "/assets/..." is served from src/assets; __dirname is four levels below src
                .filter(
                    (src) => !existsSync(join(__dirname, '../../../..', src))
                );
            expect(missing).toEqual([]);
        });

        // /trailblazer/profile opens the visitor's own profile (or a sign-in
        // page); only a /trailblazer/<handle> address shows LJ's
        it('link a public Trailblazer handle, never the bare profile address', () => {
            expect(ui.certifications.profileUrl).toMatch(
                /^https:\/\/www\.salesforce\.com\/trailblazer\/(?!profile\b)[\w-]+$/
            );
        });

        it('hide the profile link until a URL exists', () => {
            ui.certifications.profileUrl = '';
            const element = render();

            expect(element.querySelector('.badges__profile')).toBeNull();
        });

        it('link to the Trailblazer profile once a URL exists', () => {
            ui.certifications.profileUrl =
                'https://www.salesforce.com/trailblazer/example';
            const element = render();

            const link = element.querySelector('.badges__profile');
            expect(link.getAttribute('href')).toBe(
                ui.certifications.profileUrl
            );
            expect(link.textContent).toBe(ui.certifications.profileLabel);
        });
    });

    it('is accessible', async () => {
        ui.certifications.profileUrl =
            'https://www.salesforce.com/trailblazer/example';
        first.url = 'https://www.linkedin.com/example-credential';
        const element = render();

        await expect(element).toBeAccessible();
    });
});
