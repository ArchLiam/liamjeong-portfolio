import { createElement } from 'lwc';
import Experience from 'lj/experience';
import { experience, credentials, ui } from 'lj/content';

const originalVerifyUrl = credentials.verifyUrl;

const render = () => {
    const element = createElement('lj-experience', { is: Experience });
    document.body.appendChild(element);
    return element;
};

describe('lj-experience', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        credentials.verifyUrl = originalVerifyUrl;
    });

    it('renders the timeline in content order', () => {
        const element = render();

        const orgs = [...element.querySelectorAll('.timeline__org')].map(
            (node) => node.textContent
        );
        expect(orgs).toEqual(experience.map((role) => role.org));
    });

    it('keeps list semantics on the timeline', () => {
        const element = render();

        expect(element.querySelector('ol.timeline').getAttribute('role')).toBe(
            'list'
        );
    });

    it('hides the verify link until a URL exists', () => {
        credentials.verifyUrl = '';
        const element = render();

        expect(element.querySelector('.experience__verify')).toBeNull();
    });

    it('shows the verify link once a URL exists', () => {
        credentials.verifyUrl =
            'https://www.salesforce.com/trailblazer/example';
        const element = render();

        const link = element.querySelector('.experience__verify');
        expect(link.getAttribute('href')).toBe(credentials.verifyUrl);
        expect(link.textContent).toBe(ui.experience.verifyLink);
    });

    it('is accessible', async () => {
        credentials.verifyUrl =
            'https://www.salesforce.com/trailblazer/example';
        const element = render();

        await expect(element).toBeAccessible();
    });
});
