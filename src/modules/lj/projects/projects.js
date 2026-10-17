import { LightningElement } from 'lwc';
import { projects, ui } from 'lj/content';

/**
 * @description Projects as rows that fold open. Each is a native <details>
 * element, so it opens without JavaScript, works from the keyboard, and is
 * fully in the server-rendered HTML for search engines. The row shows the
 * title, program, client, role, and tags; opening it shows the summary and
 * highlights.
 * @author Liam Jeong
 */
export default class Projects extends LightningElement {
    static renderMode = 'light';

    ui = ui;

    items = projects.map((project) => ({
        ...project,
        meta: [project.program, project.client, project.role]
            .filter(Boolean)
            .join(', '),
        hasHighlights: project.highlights.length > 0,
        highlightItems: project.highlights.map((text, index) => ({
            key: `${project.id}-highlight-${index}`,
            text
        })),
        tagItems: project.tags.map((tag) => ({
            key: `${project.id}-${tag}`,
            label: tag
        }))
    }));
}
