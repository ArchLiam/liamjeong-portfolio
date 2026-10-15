import { createElement } from 'lwc';
import Lockup from 'lj/lockup';
import { profile } from 'lj/content';

const render = (props = {}) => {
    const element = createElement('lj-lockup', { is: Lockup });
    Object.assign(element, props);
    document.body.appendChild(element);
    return element;
};

describe('lj-lockup', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('shows the name and role from content', () => {
        const element = render();

        expect(element.querySelector('.lockup__name').textContent).toBe(
            profile.name
        );
        expect(element.querySelector('.lockup__role').textContent).toBe(
            profile.role
        );
    });

    it('defaults to the light variant and the light mark', () => {
        const element = render();

        expect(
            element.querySelector('.lockup').classList.contains('lockup_light')
        ).toBe(true);
        expect(element.querySelector('img').getAttribute('src')).toBe(
            '/assets/logo/logo-mark.svg'
        );
    });

    it('uses the dark mark on dark backgrounds', () => {
        const element = render({ variant: 'dark' });

        expect(
            element.querySelector('.lockup').classList.contains('lockup_dark')
        ).toBe(true);
        expect(element.querySelector('img').getAttribute('src')).toBe(
            '/assets/logo/logo-mark-dark.svg'
        );
    });

    it('keeps the mark decorative, since the name sits beside it', () => {
        const element = render();

        expect(element.querySelector('img').getAttribute('alt')).toBe('');
    });

    it('shows the domain only when asked', () => {
        expect(render().querySelector('.lockup__domain')).toBeNull();

        const withDomain = render({ showDomain: true });
        expect(withDomain.querySelector('.lockup__domain').textContent).toBe(
            profile.domain
        );
    });

    it('keeps spaces between the lines in its text content', () => {
        const element = render({ showDomain: true });

        expect(element.textContent).toBe(
            `${profile.name} ${profile.role} ${profile.domain}`
        );
    });

    it('is accessible', async () => {
        const element = render({ showDomain: true });

        await expect(element).toBeAccessible();
    });
});
