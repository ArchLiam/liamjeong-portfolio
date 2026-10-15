import { createElement } from 'lwc';
import App from 'lj/app';
import { profile, proofPoints, ui } from 'lj/content';

const originalLinks = { ...profile.links };

const render = () => {
    const element = createElement('lj-app', { is: App });
    document.body.appendChild(element);
    return element;
};

const contactLabels = (element) =>
    [...element.querySelectorAll('.contact__links a')].map(
        (a) => a.textContent
    );

describe('lj-app', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
        Object.assign(profile.links, originalLinks);
    });

    it('renders the primary navigation from content', () => {
        const element = render();

        const links = [...element.querySelectorAll('.site-header__nav a')];
        expect(links.map((a) => a.textContent)).toEqual(
            ui.nav.map((item) => item.label)
        );
        expect(links.map((a) => a.getAttribute('href'))).toEqual(
            ui.nav.map((item) => item.href)
        );
    });

    it('gives the layout skip link a focusable <main> to land on', () => {
        const element = render();

        const main = element.querySelector('main#main');
        expect(main).not.toBeNull();
        expect(main.getAttribute('tabindex')).toBe('-1');
        expect(main.querySelector('header')).toBeNull();
    });

    it('names the home link with its visible text first', () => {
        const element = render();

        const home = element.querySelector('.site-header__mark');
        expect(
            home.getAttribute('aria-label').startsWith(home.textContent)
        ).toBe(true);
    });

    it('renders one proof point per entry', () => {
        const element = render();

        expect(element.querySelectorAll('.proof__item').length).toBe(
            proofPoints.length
        );
    });

    it('shows only the contact links that have a URL', () => {
        Object.assign(profile.links, {
            email: '',
            linkedin: '',
            resume: '',
            github: 'https://github.com/example'
        });
        const element = render();

        expect(contactLabels(element)).toEqual([ui.contact.links.github]);
    });

    it('renders every contact link in content order once its URL exists', () => {
        Object.assign(profile.links, {
            email: 'hello@example.com',
            linkedin: 'https://www.linkedin.com/in/example',
            github: 'https://github.com/example',
            resume: '/assets/resume.pdf'
        });
        const element = render();

        expect(contactLabels(element)).toEqual(Object.values(ui.contact.links));
        const email = element.querySelector('.contact__links a');
        expect(email.getAttribute('href')).toBe('mailto:hello@example.com');
    });

    it('renders the footer copy and a link to the source', () => {
        const element = render();

        const footer = element.querySelector('.site-footer p');
        expect(footer.textContent).toBe(
            `${ui.footer.text} ${ui.footer.sourceLabel}.`
        );
        expect(footer.querySelector('a').getAttribute('href')).toBe(
            ui.footer.sourceUrl
        );
    });

    it('is accessible', async () => {
        const element = render();

        await expect(element).toBeAccessible();
    });
});
