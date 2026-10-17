import { existsSync } from 'fs';
import { join } from 'path';
import { createElement } from 'lwc';
import Education from 'lj/education';
import { education, ui } from 'lj/content';

const render = () => {
    const element = createElement('lj-education', { is: Education });
    document.body.appendChild(element);
    return element;
};

const schoolsOf = (element) => [...element.querySelectorAll('.school')];
const words = (node) => node.textContent.replace(/\s+/g, ' ').trim();

describe('lj-education', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('content', () => {
        const degrees = education.flatMap((school) => school.degrees);

        it('points every school logo at a file that exists', () => {
            const missing = education
                .map((school) => school.logo)
                // "/assets/..." is served from src/assets; __dirname is four levels below src
                .filter(
                    (src) => !existsSync(join(__dirname, '../../../..', src))
                );
            expect(missing).toEqual([]);
        });

        it('writes grades as words, since screen readers say "slash"', () => {
            expect(
                degrees
                    .filter((degree) => degree.grade.includes('/'))
                    .map((degree) => degree.id)
            ).toEqual([]);
        });

        it('gives every degree a unique id', () => {
            const ids = degrees.map((degree) => degree.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    it('is the #education section, named by its heading', () => {
        const element = render();

        const section = element.querySelector('section');
        expect(section.id).toBe('education');
        expect(
            element
                .querySelector(`#${section.getAttribute('aria-labelledby')}`)
                .textContent.trim()
        ).toBe(ui.education.title);
    });

    it('heads each school with its name and a decorative logo', () => {
        const element = render();

        schoolsOf(element).forEach((node, i) => {
            const school = education[i];
            const heading = node.querySelector('h3');
            const img = heading.querySelector('img');
            expect(heading.textContent.trim()).toBe(school.school);
            expect(img.getAttribute('src')).toBe(school.logo);
            expect(img.getAttribute('alt')).toBe('');
        });
    });

    it('lists each school’s degrees, named by the school heading', () => {
        const element = render();

        schoolsOf(element).forEach((node, i) => {
            const list = node.querySelector('ul');
            expect(list.getAttribute('role')).toBe('list');
            expect(list.getAttribute('aria-labelledby')).toBe(
                node.querySelector('h3').id
            );
            expect(list.querySelectorAll('.degree')).toHaveLength(
                education[i].degrees.length
            );
        });
    });

    it('reads each degree as separate words: years, field, degree, GPA, honors, activities', () => {
        const element = render();

        schoolsOf(element).forEach((node, i) => {
            [...node.querySelectorAll('.degree')].forEach((row, j) => {
                const degree = education[i].degrees[j];
                expect(words(row)).toBe(
                    [
                        degree.period,
                        degree.field,
                        degree.degree,
                        `${ui.education.gradeLabel} ${degree.grade}`,
                        degree.honors,
                        degree.activities &&
                            `${ui.education.activitiesLabel} ${degree.activities}`
                    ]
                        .filter(Boolean)
                        .join(' ')
                );
            });
        });
    });

    it('leaves out honors and activities a degree does not have', () => {
        const element = render();

        schoolsOf(element).forEach((node, i) => {
            [...node.querySelectorAll('.degree')].forEach((row, j) => {
                const degree = education[i].degrees[j];
                expect([
                    Boolean(row.querySelector('.degree__honors')),
                    Boolean(row.querySelector('.degree__activities'))
                ]).toEqual([
                    Boolean(degree.honors),
                    Boolean(degree.activities)
                ]);
            });
        });
    });

    it('is accessible', async () => {
        const element = render();

        await expect(element).toBeAccessible();
    });
});
