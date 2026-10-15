import { LightningElement } from 'lwc';
import { profile, proofPoints, ui } from 'lj/content';

/**
 * @description Page root: header, proof points, contact links, and footer,
 * around the hero, work, and experience sections.
 * @author Liam Jeong
 */
export default class App extends LightningElement {
    static renderMode = 'light';

    profile = profile;
    proofPoints = proofPoints;
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
