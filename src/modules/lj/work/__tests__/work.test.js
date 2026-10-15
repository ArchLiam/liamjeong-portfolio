import { createElement } from 'lwc';
import Work from 'lj/work';
import { caseStudies, ui } from 'lj/content';

describe('lj-work', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('renders one expandable row per case study', () => {
        const element = createElement('lj-work', { is: Work });
        document.body.appendChild(element);

        // Light DOM: query the element directly, not a shadow root.
        const rows = element.querySelectorAll('details.case');
        expect(rows.length).toBe(caseStudies.length);
    });

    it('renders every tag for each case study', () => {
        const element = createElement('lj-work', { is: Work });
        document.body.appendChild(element);

        const expectedTags = caseStudies.reduce(
            (total, study) => total + study.tags.length,
            0
        );
        expect(element.querySelectorAll('.case__tag').length).toBe(
            expectedTags
        );
    });

    it('labels every case study field from content', () => {
        const element = createElement('lj-work', { is: Work });
        document.body.appendChild(element);

        const expected = Object.values(ui.work.fields);
        element.querySelectorAll('details.case').forEach((row) => {
            const labels = [...row.querySelectorAll('dt')].map(
                (dt) => dt.textContent
            );
            expect(labels).toEqual(expected);
        });
    });

    it('keeps list semantics on the case list', () => {
        const element = createElement('lj-work', { is: Work });
        document.body.appendChild(element);

        expect(element.querySelector('.work__list').getAttribute('role')).toBe(
            'list'
        );
    });

    it('is accessible', async () => {
        const element = createElement('lj-work', { is: Work });
        document.body.appendChild(element);

        await expect(element).toBeAccessible();
    });
});
