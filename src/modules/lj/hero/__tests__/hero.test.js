import { createElement } from 'lwc';
import Hero from 'lj/hero';
import { gsap } from 'gsap';
import { schema } from 'lj/content';

const mockMatchMedia = (reduce) => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: reduce && query.includes('reduce'),
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }));
};

describe('lj-hero', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        jest.clearAllMocks();
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
