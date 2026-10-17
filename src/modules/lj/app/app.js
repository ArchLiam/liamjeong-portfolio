import { LightningElement } from 'lwc';
import { profile, ui } from 'lj/content';

/**
 * @description Page root: header, contact links, and footer, around the
 * hero, recommendations, work, and experience sections.
 * @author Liam Jeong
 */
export default class App extends LightningElement {
    static renderMode = 'light';

    profile = profile;
    ui = ui;

    // In content order, skipping any link whose URL hasn't been added yet.
    contactLinks = Object.entries(ui.contact.links)
        .filter(([key]) => profile.links[key])
        .map(([key, label]) => ({
            key,
            label,
            href:
                key === 'email'
                    ? `mailto:${profile.links.email}`
                    : profile.links[key]
        }));
}
