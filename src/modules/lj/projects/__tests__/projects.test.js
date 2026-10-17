import { createElement } from 'lwc';
import Projects from 'lj/projects';
import { projects, ui } from 'lj/content';

const render = () => {
    const element = createElement('lj-projects', { is: Projects });
    document.body.appendChild(element);
    return element;
};

const rowsOf = (element) => [...element.querySelectorAll('details.project')];
const words = (node) => node.textContent.replace(/\s+/g, ' ').trim();
const metaOf = (project) =>
    [project.program, project.client, project.role].filter(Boolean).join(', ');

describe('lj-projects', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('content', () => {
        const text = (project) =>
            [project.title, project.summary, ...project.highlights].join(' ');

        it('gives every project a unique id', () => {
            const ids = projects.map((project) => project.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('says Data 360, the name the rest of the site uses', () => {
            expect(
                projects
                    .filter((project) => /Data Cloud/.test(text(project)))
                    .map((project) => project.id)
            ).toEqual([]);
        });

        it('uses no arrows, which screen readers read as "right arrow"', () => {
            expect(
                projects
                    .filter((project) => /[→←↔⇒]/.test(text(project)))
                    .map((project) => project.id)
            ).toEqual([]);
        });

        it('carries no dates; LJ chose to show none', () => {
            expect(
                projects
                    .filter((project) => 'period' in project)
                    .map((project) => project.id)
            ).toEqual([]);
        });
    });

    it('is the section the Projects links point at', () => {
        const element = render();

        const section = element.querySelector('section');
        expect(section.id).toBe('projects');
        expect(
            element
                .querySelector(`#${section.getAttribute('aria-labelledby')}`)
                .textContent.trim()
        ).toBe(ui.projects.title);
    });

    it('renders one folded row per project, in content order', () => {
        const element = render();

        const rows = rowsOf(element);
        expect(rows).toHaveLength(projects.length);
        rows.forEach((row) => {
            expect(row.open).toBe(false);
        });
        expect(
            rows.map((row) => words(row.querySelector('.project__title')))
        ).toEqual(projects.map((project) => project.title));
    });

    // The row is the toggle's accessible name: title, program, client, role,
    // then the tags, each read as its own words
    it('reads each row as separate words', () => {
        const element = render();

        rowsOf(element).forEach((row, i) => {
            const project = projects[i];
            expect(words(row.querySelector('summary'))).toBe(
                [project.title, metaOf(project), ...project.tags].join(' ')
            );
        });
    });

    it('shows each summary as written when opened', () => {
        const element = render();

        expect(
            rowsOf(element).map((row) =>
                words(row.querySelector('.project__body .project__description'))
            )
        ).toEqual(projects.map((project) => project.summary));
    });

    it('lists every highlight, and no empty list when there are none', () => {
        const element = render();

        expect(
            rowsOf(element).map((row) =>
                [...row.querySelectorAll('.project__highlights li')].map((li) =>
                    li.textContent.trim()
                )
            )
        ).toEqual(projects.map((project) => project.highlights));
        rowsOf(element)
            .filter((_, i) => projects[i].highlights.length === 0)
            .forEach((row) => {
                expect(row.querySelector('.project__highlights')).toBeNull();
            });
    });

    it('keeps list semantics on every unstyled list', () => {
        const element = render();

        const lists = [
            ...element.querySelectorAll('.projects__list, .project__highlights')
        ];
        expect(lists.length).toBeGreaterThan(1);
        lists.forEach((list) => {
            expect(list.getAttribute('role')).toBe('list');
        });
    });

    it('is accessible folded', async () => {
        const element = render();

        await expect(element).toBeAccessible();
    });

    it('is accessible with every row open', async () => {
        const element = render();
        rowsOf(element).forEach((row) => {
            row.open = true;
        });

        await expect(element).toBeAccessible();
    });
});
