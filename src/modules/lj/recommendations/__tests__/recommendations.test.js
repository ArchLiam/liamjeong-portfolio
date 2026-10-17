import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'lwc';
import Recommendations from 'lj/recommendations';
import { recommendations, ui } from 'lj/content';

const render = () => {
    const element = createElement('lj-recommendations', {
        is: Recommendations
    });
    document.body.appendChild(element);
    return element;
};

// Let LWC re-render after a state change
const flush = () => Promise.resolve();

const panelsOf = (element) => [
    ...element.querySelectorAll('[role="tabpanel"]')
];
const tabsOf = (element) => [...element.querySelectorAll('[role="tab"]')];
const selectedIndex = (element) =>
    tabsOf(element).findIndex(
        (tab) => tab.getAttribute('aria-selected') === 'true'
    );
const activePanels = (element) =>
    panelsOf(element).filter((panel) =>
        panel.classList.contains('recommendations__panel_active')
    );
const arrow = (element, label) =>
    element.querySelector(`.recommendations__arrow[aria-label="${label}"]`);
const press = (target, key) =>
    target.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    );
const initialsOf = (name) =>
    name
        .split(/\s+/)
        .map((part) => part[0])
        .join('');

describe('lj-recommendations', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('content', () => {
        it('renders every quote, in content order, so they all reach the HTML', () => {
            const element = render();

            expect(
                panelsOf(element).map((panel) =>
                    panel
                        .querySelector('.recommendation__name')
                        .textContent.trim()
                )
            ).toEqual(recommendations.map((rec) => rec.name));
        });

        it('quotes each person exactly as stored, inside a blockquote', () => {
            const element = render();

            panelsOf(element).forEach((panel, i) => {
                expect(panel.querySelector('blockquote p').textContent).toBe(
                    recommendations[i].quote
                );
            });
        });

        it('credits each quote with title, relationship, and date', () => {
            const element = render();

            panelsOf(element).forEach((panel, i) => {
                const rec = recommendations[i];
                const caption = panel.querySelector('figcaption').textContent;
                [rec.title, rec.relationship, rec.date].forEach((part) => {
                    expect(caption).toContain(part);
                });
            });
        });

        it('shows photos beside the quote as decorative images', () => {
            const element = render();
            const withPhoto = recommendations.filter((rec) => rec.photo);

            expect(withPhoto.length).toBeGreaterThan(0);
            withPhoto.forEach((rec) => {
                const img =
                    panelsOf(element)[
                        recommendations.indexOf(rec)
                    ].querySelector('img');
                expect(img.getAttribute('src')).toBe(rec.photo);
                expect(img.getAttribute('alt')).toBe('');
            });
        });

        it('shows hidden initials beside the quote when there is no photo', () => {
            const element = render();
            const withoutPhoto = recommendations.filter((rec) => !rec.photo);

            withoutPhoto.forEach((rec) => {
                const initials = panelsOf(element)[
                    recommendations.indexOf(rec)
                ].querySelector('.recommendation__avatar_initials');
                expect(initials.getAttribute('aria-hidden')).toBe('true');
                expect(initials.textContent).toBe(initialsOf(rec.name));
            });
        });

        it('points every photo at a file that exists', () => {
            const missing = recommendations
                .filter((rec) => rec.photo)
                // "/assets/..." is served from src/assets; __dirname is four levels below src
                .filter(
                    (rec) =>
                        !existsSync(join(__dirname, '../../../..', rec.photo))
                )
                .map((rec) => rec.photo);
            expect(missing).toEqual([]);
        });

        it('links to the full recommendations on LinkedIn', () => {
            const element = render();

            const link = element.querySelector('.recommendations__more');
            expect(link.getAttribute('href')).toBe(ui.recommendations.allUrl);
            expect(link.textContent).toBe(ui.recommendations.allLabel);
        });
    });

    describe('tabs', () => {
        it('wires each tab to its panel', () => {
            const element = render();
            const tabs = tabsOf(element);
            const panels = panelsOf(element);

            expect(tabs).toHaveLength(recommendations.length);
            expect(
                element
                    .querySelector('[role="tablist"]')
                    .getAttribute('aria-label')
            ).toBe(ui.recommendations.pickerLabel);
            tabs.forEach((tab, i) => {
                expect(tab.getAttribute('aria-controls')).toBe(panels[i].id);
                expect(panels[i].getAttribute('aria-labelledby')).toBe(tab.id);
            });
        });

        // The tab's name comes from its avatar, so the visible initials and
        // the photo both name the person (no aria-label on the tab to drift
        // from what is shown, WCAG 2.5.3)
        it('names each tab after the person through its avatar', () => {
            const element = render();
            const tabs = tabsOf(element);

            expect(
                tabs.map((tab) => {
                    const avatar = tab.querySelector('img, [role="img"]');
                    return (
                        avatar.getAttribute('alt') ??
                        avatar.getAttribute('aria-label')
                    );
                })
            ).toEqual(recommendations.map((rec) => rec.name));
            expect(
                tabs.filter((tab) => tab.hasAttribute('aria-label'))
            ).toEqual([]);
        });

        it('shows the photo on the tab, or initials when there is none', () => {
            const element = render();

            expect(
                tabsOf(element).map(
                    (tab) =>
                        tab.querySelector('img')?.getAttribute('src') ??
                        tab.querySelector(
                            '.recommendations__tab-photo_initials'
                        ).textContent
                )
            ).toEqual(
                recommendations.map((rec) => rec.photo ?? initialsOf(rec.name))
            );
        });

        it('starts on the first recommendation, with only its tab in the Tab order', () => {
            const element = render();

            expect(selectedIndex(element)).toBe(0);
            expect(activePanels(element)).toEqual([panelsOf(element)[0]]);
            expect(tabsOf(element).map((tab) => tab.tabIndex)).toEqual(
                recommendations.map((_, i) => (i === 0 ? 0 : -1))
            );
            expect(
                element.querySelector('.recommendations__count').textContent
            ).toContain(`01 / 0${recommendations.length}`);
        });

        it('shows the clicked recommendation', async () => {
            const element = render();

            tabsOf(element)[2].click();
            await flush();

            expect(selectedIndex(element)).toBe(2);
            expect(activePanels(element)).toEqual([panelsOf(element)[2]]);
            expect(tabsOf(element)[2].tabIndex).toBe(0);
            expect(
                element.querySelector('.recommendations__count').textContent
            ).toContain('03 /');
        });

        it.each([
            ['ArrowRight', 0, 1],
            ['ArrowLeft', 1, 0],
            ['ArrowRight', recommendations.length - 1, 0],
            ['ArrowLeft', 0, recommendations.length - 1],
            ['Home', 3, 0],
            ['End', 1, recommendations.length - 1]
        ])(
            '%s from tab %i moves to tab %i and focuses it',
            async (key, from, to) => {
                const element = render();
                tabsOf(element)[from].click();
                await flush();

                press(tabsOf(element)[from], key);
                await flush();

                expect(selectedIndex(element)).toBe(to);
                expect(document.activeElement).toBe(tabsOf(element)[to]);
            }
        );

        it('leaves other keys to the browser', async () => {
            const element = render();
            const event = new KeyboardEvent('keydown', {
                key: 'Tab',
                bubbles: true,
                cancelable: true
            });

            tabsOf(element)[0].dispatchEvent(event);
            await flush();

            expect(event.defaultPrevented).toBe(false);
            expect(selectedIndex(element)).toBe(0);
        });
    });

    describe('previous and next', () => {
        it('step through the recommendations and wrap at both ends', async () => {
            const element = render();
            const last = recommendations.length - 1;

            arrow(element, ui.recommendations.previous).click();
            await flush();
            expect(selectedIndex(element)).toBe(last);

            arrow(element, ui.recommendations.next).click();
            await flush();
            expect(selectedIndex(element)).toBe(0);

            arrow(element, ui.recommendations.next).click();
            await flush();
            expect(selectedIndex(element)).toBe(1);
        });

        it('announce who is quoted now, since focus stays on the button', async () => {
            const element = render();
            const status = element.querySelector('[aria-live="polite"]');

            expect(status.textContent).toBe('');

            arrow(element, ui.recommendations.next).click();
            await flush();

            expect(status.textContent).toBe(
                `${recommendations[1].name}, 2 of ${recommendations.length}`
            );
        });

        it('stay quiet when a tab is used, since the tab announces itself', async () => {
            const element = render();
            const status = element.querySelector('[aria-live="polite"]');

            arrow(element, ui.recommendations.next).click();
            await flush();
            tabsOf(element)[3].click();
            await flush();

            expect(status.textContent).toBe('');
        });
    });

    it('never changes the quote on its own', async () => {
        jest.useFakeTimers();
        try {
            const element = render();

            jest.advanceTimersByTime(60000);
            await flush();

            expect(selectedIndex(element)).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it('is accessible', async () => {
        const element = render();

        await expect(element).toBeAccessible();
    });

    it('is accessible after switching quotes', async () => {
        const element = render();
        arrow(element, ui.recommendations.next).click();
        await flush();

        await expect(element).toBeAccessible();
    });
});
