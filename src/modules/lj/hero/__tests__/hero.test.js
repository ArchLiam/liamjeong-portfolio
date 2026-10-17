import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'lwc';
import Hero from 'lj/hero';
import { gsap } from 'gsap';
import { analytics, profile, schema, ui } from 'lj/content';
import { icons } from 'lj/icons';

// Each card's box as rendered: position from its wrapper's translate(), size from its card rect
const cardBoxes = (element) =>
    new Map(
        [...element.querySelectorAll('[data-node]')].map((card) => {
            const [x, y] = card.parentElement
                .getAttribute('transform')
                .match(/-?\d+(\.\d+)?/g)
                .map(Number);
            const rect = card.querySelector('.schema-node__card');
            const width = Number(rect.getAttribute('width'));
            const height = Number(rect.getAttribute('height'));
            return [
                card.getAttribute('data-id'),
                { left: x, top: y, right: x + width, bottom: y + height }
            ];
        })
    );

// Points along a rendered connector: "M x0 y0 C x1 y1, x2 y2, x3 y3"
const pointsAlong = (d, steps = 100) => {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = d
        .match(/-?\d+(\.\d+)?/g)
        .map(Number);
    return Array.from({ length: steps + 1 }, (_, i) => {
        const t = i / steps;
        const u = 1 - t;
        return {
            x:
                u ** 3 * x0 +
                3 * u ** 2 * t * x1 +
                3 * u * t ** 2 * x2 +
                t ** 3 * x3,
            y:
                u ** 3 * y0 +
                3 * u ** 2 * t * y1 +
                3 * u * t ** 2 * y2 +
                t ** 3 * y3
        };
    });
};

const inside = (point, b) =>
    point.x > b.left &&
    point.x < b.right &&
    point.y > b.top &&
    point.y < b.bottom;

const mockMatchMedia = (reduce) => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }));
};

const render = () => {
    const element = createElement('lj-hero', { is: Hero });
    document.body.appendChild(element);
    return element;
};

describe('lj-hero', () => {
    let nowSpy;

    beforeEach(() => {
        // Pin the clock: past ~4s the intro treats hydration as late and skips itself
        nowSpy = jest.spyOn(performance, 'now').mockReturnValue(100);
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        nowSpy.mockRestore();
        jest.clearAllMocks();
    });

    describe('résumé button', () => {
        it('downloads the résumé under a clean file name', () => {
            const element = render();

            const link = element.querySelector('.hero__resume');
            expect(link.getAttribute('href')).toBe(profile.links.resume);
            expect(link.getAttribute('download')).toBe(ui.hero.resumeFileName);
            expect(ui.hero.resumeFileName).toMatch(/^[\w-]+\.pdf$/);
        });

        // Its name is its visible text, which says it's a PDF (2.5.3, and
        // nobody is surprised by a download); the icon is hidden
        it('is named by its visible label, with the icon hidden', () => {
            const element = render();

            const link = element.querySelector('.hero__resume');
            expect(link.textContent.trim()).toBe(ui.hero.resumeAction);
            expect(link.hasAttribute('aria-label')).toBe(false);
            expect(link.querySelector('svg').getAttribute('aria-hidden')).toBe(
                'true'
            );
        });

        it('points at a file that exists', () => {
            // "/assets/..." is served from src/assets; __dirname is four levels below src
            expect(
                existsSync(join(__dirname, '../../../..', profile.links.resume))
            ).toBe(true);
        });
    });

    it('renders every node and edge in the diagram', () => {
        mockMatchMedia(false);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);

        expect(element.querySelectorAll('[data-node]').length).toBe(
            schema.nodes.length
        );
        expect(element.querySelectorAll('[data-edge]').length).toBe(
            schema.edges.length
        );
    });

    it('builds the intro timeline when motion is allowed', () => {
        mockMatchMedia(false);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);

        expect(gsap.timeline).toHaveBeenCalledTimes(1);
    });

    it('skips the timeline and shows everything when reduced motion is requested', () => {
        mockMatchMedia(true);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);

        expect(gsap.timeline).not.toHaveBeenCalled();
        expect(gsap.set).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({ opacity: 1 })
        );
    });

    it('finishes, then kills, the timeline when removed from the page', () => {
        mockMatchMedia(false);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);
        const tl = gsap.timeline.mock.results[0].value;

        document.body.removeChild(element);
        // Jumping to the end first means a reinserted hero is never left half-faded.
        expect(tl.progress).toHaveBeenCalledWith(1);
        expect(tl.kill).toHaveBeenCalled();
    });

    it('draws an SLDS icon in every card', () => {
        mockMatchMedia(true);
        const element = render();

        element.querySelectorAll('[data-node]').forEach((card) => {
            expect(
                card.querySelectorAll('.schema-node__icon path').length
            ).toBeGreaterThan(0);
        });
    });

    it('names only icons that exist in lj/icons', () => {
        const missing = schema.nodes
            .filter((node) => !icons[node.icon])
            .map((node) => node.id);
        expect(missing).toEqual([]);
    });

    it('renders a pulse for every connector and a port at each end', () => {
        mockMatchMedia(true);
        const element = render();

        expect(element.querySelectorAll('[data-pulse]').length).toBe(
            schema.edges.length
        );
        expect(element.querySelectorAll('[data-port]').length).toBe(
            schema.edges.length * 2
        );
    });

    it('renders the hub last, so the other cards fly out from under it', () => {
        mockMatchMedia(true);
        const element = render();

        const cards = element.querySelectorAll('[data-node]');
        expect(element.querySelectorAll('[data-hub]').length).toBe(1);
        expect(cards[cards.length - 1].hasAttribute('data-hub')).toBe(true);
    });

    it('cancels the CSS fallback reveal once the intro is playing', () => {
        mockMatchMedia(false);
        render();

        expect(gsap.set).toHaveBeenCalledWith(expect.any(Array), {
            animation: 'none'
        });
    });

    it('shows the finished diagram instead of replaying it when hydration is late', () => {
        mockMatchMedia(false);
        nowSpy.mockReturnValue(6000);
        render();

        expect(gsap.timeline).not.toHaveBeenCalled();
        expect(gsap.set).toHaveBeenCalledWith(
            expect.any(Array),
            expect.objectContaining({ opacity: 1 })
        );
    });

    it('pulses in waves: deploy, platform, data, then grounding lands the dot', () => {
        mockMatchMedia(false);
        const element = render();
        const tl = gsap.timeline.mock.results[0].value;
        const startOf = (target) =>
            tl.fromTo.mock.calls.find(([t]) => t === target)[3];

        const hub = schema.nodes.find((node) => node.hub).id;
        const focus = schema.nodes.find((node) => node.focus).id;
        const pulses = [...element.querySelectorAll('[data-pulse]')];
        const startsWhere = (test) =>
            pulses
                .filter((_, i) => test(schema.edges[i]))
                .map((pulse) => startOf(pulse));

        const intoHub = startsWhere(([, to]) => to === hub);
        const outOfHub = startsWhere(([from]) => from === hub);
        const grounding = startsWhere(
            ([from, to]) => from !== hub && to === focus
        );
        expect(intoHub.length).toBeGreaterThan(0);
        expect(Math.max(...intoHub)).toBeLessThan(Math.min(...outOfHub));
        expect(Math.max(...outOfHub)).toBeLessThan(Math.min(...grounding));
        expect(startOf(element.querySelector('[data-focus]'))).toBeGreaterThan(
            Math.max(...grounding)
        );
    });

    it("lists each card's items as rows, in content order", () => {
        mockMatchMedia(true);
        const element = render();

        schema.nodes.forEach((node) => {
            const card = element.querySelector(`[data-id="${node.id}"]`);
            // Each row ends in a space for WCAG 2.5.3 (see hero.html)
            const rows = [...card.querySelectorAll('.schema-node__field')].map(
                (row) => row.textContent.trim()
            );
            expect(rows).toEqual(node.items);
        });
    });

    it('keeps the pulses and the ripple hidden until their turn', () => {
        mockMatchMedia(false);
        const element = render();
        const tl = gsap.timeline.mock.results[0].value;
        const toVarsOf = (target) =>
            tl.fromTo.mock.calls.find(([t]) => t === target)[2];

        // Their start states are visible, so GSAP must not apply them up front
        const late = [
            ...element.querySelectorAll('[data-pulse]'),
            element.querySelector('[data-ripple]')
        ];
        late.forEach((target) => {
            expect(toVarsOf(target).immediateRender).toBe(false);
        });
    });

    it('finishes in under five seconds, so it needs no pause control (WCAG 2.2.2)', () => {
        mockMatchMedia(false);
        render();
        const tl = gsap.timeline.mock.results[0].value;

        const steps = [
            ...tl.fromTo.mock.calls.map(([targets, , vars, at]) => ({
                targets,
                vars,
                at
            })),
            ...tl.to.mock.calls.map(([targets, vars, at]) => ({
                targets,
                vars,
                at
            }))
        ];
        const ends = steps.map(({ targets, vars, at }) => {
            const count = Array.isArray(targets) ? targets.length : 1;
            return (
                at +
                (vars.duration || 0) +
                (vars.stagger || 0) * Math.max(0, count - 1)
            );
        });
        expect(Math.max(...ends)).toBeLessThan(5);
    });

    describe('selecting a card', () => {
        const cardFor = (element, id) =>
            element.querySelector(`[data-id="${id}"]`);
        // jsdom's SVG elements have no click(); send the event a browser would
        const tap = (card) =>
            card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const hintOf = (element) =>
            element
                .querySelector('.schema-hint')
                .textContent.replace(/\s+/g, ' ')
                .trim();
        const labelOf = (id) =>
            schema.nodes.find((node) => node.id === id).label;
        const linkedTo = (id) =>
            schema.edges
                .filter(([from, to]) => from === id || to === id)
                .map(([from, to]) => (from === id ? to : from));

        it('counts each selection, by click or by key, under the card label', () => {
            mockMatchMedia(true);
            window.umami = { track: jest.fn() };
            try {
                const element = render();

                tap(cardFor(element, 'omni'));
                cardFor(element, 'data360').dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'Enter',
                        bubbles: true,
                        cancelable: true
                    })
                );

                expect(window.umami.track.mock.calls).toEqual([
                    [analytics.diagramCard, { card: labelOf('omni') }],
                    [analytics.diagramCard, { card: labelOf('data360') }]
                ]);
            } finally {
                delete window.umami;
            }
        });

        it("keeps each card's visible words inside its spoken name (WCAG 2.5.3)", () => {
            mockMatchMedia(true);
            const element = render();
            const words = (text) =>
                text
                    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
                    .split(/\s+/)
                    .filter(Boolean);

            schema.nodes.forEach((node) => {
                const card = element.querySelector(`[data-id="${node.id}"]`);
                const name = words(card.getAttribute('aria-label'));
                // Words, not one run-together string: the text pieces must be separated
                expect(words(card.textContent)).toEqual(name);
            });
        });

        it('makes every card a labelled button', () => {
            mockMatchMedia(true);
            const element = render();

            schema.nodes.forEach((node) => {
                const card = cardFor(element, node.id);
                expect(card.getAttribute('role')).toBe('button');
                expect(card.getAttribute('tabindex')).toBe('0');
                expect(card.getAttribute('aria-label')).toBe(
                    `${node.label}: ${node.items.join(', ')}`
                );
            });
        });

        it('starts on the focus card and shows the tap hint', () => {
            mockMatchMedia(true);
            const element = render();
            const focusId = schema.nodes.find((node) => node.focus).id;

            expect(cardFor(element, focusId).getAttribute('aria-pressed')).toBe(
                'true'
            );
            expect(hintOf(element)).toBe(ui.diagram.hint);
        });

        it('moves the amber highlight and the dot to a clicked card', async () => {
            mockMatchMedia(true);
            const element = render();
            const focusId = schema.nodes.find((node) => node.focus).id;
            const target = schema.nodes.find((node) => !node.focus).id;

            tap(cardFor(element, target));
            await Promise.resolve();

            const picked = cardFor(element, target);
            expect(picked.classList.contains('schema-node_focus')).toBe(true);
            expect(picked.getAttribute('aria-pressed')).toBe('true');
            expect(picked.querySelector('[data-focus]')).not.toBeNull();
            expect(cardFor(element, focusId).getAttribute('aria-pressed')).toBe(
                'false'
            );
            expect(element.querySelectorAll('[data-focus]').length).toBe(1);
        });

        it('selects with Enter and Space as well', async () => {
            mockMatchMedia(true);
            const element = render();
            const [first, second] = schema.nodes.filter((node) => !node.focus);

            for (const [node, key] of [
                [first, 'Enter'],
                [second, ' ']
            ]) {
                const event = new KeyboardEvent('keydown', {
                    key,
                    bubbles: true,
                    cancelable: true
                });
                cardFor(element, node.id).dispatchEvent(event);
                // eslint-disable-next-line no-await-in-loop
                await Promise.resolve();
                expect(event.defaultPrevented).toBe(true);
                expect(
                    cardFor(element, node.id).getAttribute('aria-pressed')
                ).toBe('true');
            }
        });

        it("traces the selected card's connectors and outlines its neighbours", async () => {
            mockMatchMedia(true);
            const element = render();
            const target = schema.nodes.find((node) => node.hub).id;

            tap(cardFor(element, target));
            await Promise.resolve();

            const edges = [...element.querySelectorAll('[data-edge]')];
            schema.edges.forEach(([from, to], i) => {
                const touches = from === target || to === target;
                expect(edges[i].classList.contains('schema-edge_active')).toBe(
                    touches
                );
                expect(edges[i].classList.contains('schema-edge_dim')).toBe(
                    !touches
                );
            });
            linkedTo(target).forEach((id) => {
                expect(
                    cardFor(element, id).classList.contains(
                        'schema-node_linked'
                    )
                ).toBe(true);
            });
        });

        it("shows the selected card's name and summary in the live caption", async () => {
            mockMatchMedia(true);
            const element = render();
            const target = schema.nodes.find((node) => !node.focus);

            tap(cardFor(element, target.id));
            await Promise.resolve();

            expect(hintOf(element)).toBe(`${target.label} ${target.summary}`);
            expect(
                element.querySelector('.schema-hint__label').textContent
            ).toBe(target.label);
            expect(
                element.querySelector('.schema-hint').getAttribute('aria-live')
            ).toBe('polite');
        });

        it('has a summary for every card that names each card it connects to', () => {
            // Screen reader users get the lines only through this text
            schema.nodes.forEach((node) => {
                expect(node.summary).toBeTruthy();
                linkedTo(node.id).forEach((id) => {
                    expect(node.summary.toLowerCase()).toContain(
                        labelOf(id).toLowerCase()
                    );
                });
            });
        });

        it("pulses along the selected card's connectors when motion is allowed", async () => {
            mockMatchMedia(false);
            const element = render();
            const target = schema.nodes.find((node) => node.hub).id;
            gsap.timeline.mockClear();

            tap(cardFor(element, target));
            await Promise.resolve();

            expect(gsap.timeline).toHaveBeenCalledTimes(1);
            const tl = gsap.timeline.mock.results[0].value;
            const pulses = [...element.querySelectorAll('[data-pulse]')];
            const traced = pulses.filter((_, i) =>
                schema.edges[i].includes(target)
            );
            traced.forEach((pulse) => {
                expect(tl.fromTo).toHaveBeenCalledWith(
                    pulse,
                    expect.anything(),
                    expect.objectContaining({ immediateRender: false }),
                    expect.any(Number)
                );
            });
        });

        it('moves the highlight without animation for reduced motion', async () => {
            mockMatchMedia(true);
            const element = render();
            const target = schema.nodes.find((node) => !node.focus).id;

            tap(cardFor(element, target));
            await Promise.resolve();

            expect(gsap.timeline).not.toHaveBeenCalled();
            expect(cardFor(element, target).getAttribute('aria-pressed')).toBe(
                'true'
            );
        });
    });

    it('keeps every card inside the drawing area', () => {
        mockMatchMedia(true);
        const element = render();
        const svg = element.querySelector('svg.schema');
        const [, , width, height] = (
            svg.getAttribute('viewBox') || svg.getAttribute('viewbox')
        )
            .split(' ')
            .map(Number);

        const outside = [...cardBoxes(element)]
            .filter(
                ([, b]) =>
                    b.left < 0 ||
                    b.top < 0 ||
                    b.right > width ||
                    b.bottom > height
            )
            .map(([id]) => id);
        expect(outside).toEqual([]);
    });

    it('never overlaps two cards', () => {
        mockMatchMedia(true);
        const boxes = [...cardBoxes(render())];

        const overlaps = [];
        boxes.forEach(([aId, p], i) => {
            boxes.slice(i + 1).forEach(([bId, q]) => {
                if (
                    p.left < q.right &&
                    q.left < p.right &&
                    p.top < q.bottom &&
                    q.top < p.bottom
                ) {
                    overlaps.push(`${aId}/${bId}`);
                }
            });
        });
        expect(overlaps).toEqual([]);
    });

    it('never runs a connector behind a card it does not connect', () => {
        mockMatchMedia(true);
        const element = render();
        const boxes = cardBoxes(element);
        const paths = element.querySelectorAll('[data-edge]');

        const behind = [];
        schema.edges.forEach(([fromId, toId], i) => {
            const points = pointsAlong(paths[i].getAttribute('d'));
            [...boxes]
                .filter(([id]) => id !== fromId && id !== toId)
                .forEach(([id, b]) => {
                    if (points.some((point) => inside(point, b))) {
                        behind.push(`${fromId}-${toId} behind ${id}`);
                    }
                });
        });
        expect(behind).toEqual([]);
    });

    it('labels the diagram from content for screen readers', () => {
        mockMatchMedia(true);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);

        expect(element.querySelector('svg title').textContent).toBe(
            schema.title
        );
        expect(element.querySelector('svg desc').textContent).toBe(
            schema.description
        );
    });

    it('is accessible', async () => {
        mockMatchMedia(true);
        const element = createElement('lj-hero', { is: Hero });
        document.body.appendChild(element);

        await expect(element).toBeAccessible();
    });
});
