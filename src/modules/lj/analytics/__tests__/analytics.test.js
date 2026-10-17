import { track, trackClick } from 'lj/analytics';

// Builds an element with attributes and children, without innerHTML
const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([name, value]) =>
        node.setAttribute(name, value)
    );
    children.forEach((child) =>
        node.append(
            typeof child === 'string' ? document.createTextNode(child) : child
        )
    );
    document.body.appendChild(node);
    return node;
};

// A click event from `target`, as the browser would deliver it
const clickOn = (target) => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'target', { value: target });
    return event;
};

describe('lj/analytics', () => {
    afterEach(() => {
        delete window.umami;
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('track', () => {
        it('sends the event to Umami', () => {
            window.umami = { track: jest.fn() };

            track('Hero: Projects', { from: 'hero' });

            expect(window.umami.track).toHaveBeenCalledWith('Hero: Projects', {
                from: 'hero'
            });
        });

        it('does nothing while Umami is missing (blocked, loading, or another host)', () => {
            expect(() => track('Hero: Projects')).not.toThrow();
        });

        it('never lets an Umami error reach the page', () => {
            window.umami = {
                track: () => {
                    throw new Error('blocked');
                }
            };

            expect(() => track('Hero: Projects')).not.toThrow();
        });
    });

    describe('trackClick', () => {
        beforeEach(() => {
            window.umami = { track: jest.fn() };
        });

        it('sends the nearest data-track name with its data-track-* properties', () => {
            const icon = document.createElement('span');
            el(
                'a',
                {
                    href: '/r.pdf',
                    download: '',
                    'data-track': 'Download résumé',
                    'data-track-from': 'hero'
                },
                icon,
                'Download'
            );

            trackClick(clickOn(icon));

            expect(window.umami.track).toHaveBeenCalledWith('Download résumé', {
                from: 'hero'
            });
        });

        it('sends no properties when there are none', () => {
            const link = el(
                'a',
                { href: '#projects', 'data-track': 'Hero: Projects' },
                'Projects'
            );

            trackClick(clickOn(link));

            expect(window.umami.track).toHaveBeenCalledWith(
                'Hero: Projects',
                undefined
            );
        });

        // Umami's own data-umami-event cancels link clicks and navigates by
        // hand, which loses <a download>; this must leave the click alone
        it('leaves the click itself alone', () => {
            const link = el(
                'a',
                {
                    href: '/r.pdf',
                    download: '',
                    'data-track': 'Download résumé'
                },
                'Download'
            );
            const event = clickOn(link);

            trackClick(event);

            expect(event.defaultPrevented).toBe(false);
        });

        it('ignores clicks on anything not marked data-track', () => {
            const link = el('a', { href: '#x' }, 'Plain');

            trackClick(clickOn(link));

            expect(window.umami.track).not.toHaveBeenCalled();
        });

        it('counts a folded row when it opens, not when it closes', () => {
            const summary = document.createElement('summary');
            summary.setAttribute('data-track', 'Open project');
            summary.setAttribute('data-track-project', 'Agentforce pilot');
            summary.textContent = 'Agentforce pilot';
            const details = el('details', {}, summary);

            trackClick(clickOn(summary));
            details.open = true;
            trackClick(clickOn(summary));

            expect(window.umami.track).toHaveBeenCalledTimes(1);
            expect(window.umami.track).toHaveBeenCalledWith('Open project', {
                project: 'Agentforce pilot'
            });
        });
    });
});
