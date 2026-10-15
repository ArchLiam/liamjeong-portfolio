import { LightningElement } from 'lwc';
import { caseStudies, ui } from 'lj/content';

/**
 * @description Selected work. Each case study is a native <details> element,
 * so it expands without JavaScript, is keyboard accessible, and renders fully
 * in the server-rendered HTML for search engines.
 * @author Liam Jeong
 */
export default class Work extends LightningElement {
    static renderMode = 'light';

    ui = ui;

    caseStudies = caseStudies.map((study) => ({
        ...study,
        headingId: `case-${study.id}`,
        tagItems: study.tags.map((tag) => ({
            key: `${study.id}-${tag}`,
            label: tag
        }))
    }));
}
