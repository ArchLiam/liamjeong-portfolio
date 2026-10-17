import { LightningElement } from 'lwc';
import { analytics, profile, ui } from 'lj/content';
import { trackClick } from 'lj/analytics';

/**
 * @description Page root: header, contact links, and footer, around the
 * page's sections. Counts clicks on anything marked data-track, with one
 * listener here at the root (see lj/analytics).
 * @author Liam Jeong
 */
export default class App extends LightningElement {
    static renderMode = 'light';

    profile = profile;
    ui = ui;
    analytics = analytics;
    _listening = false;

    // In content order, skipping any link whose URL hasn't been added yet.
    contactLinks = Object.entries(ui.contact.links)
        .filter(([key]) => profile.links[key])
        .map(([key, label]) => ({
            key,
            label,
            href:
                key === 'email'
                    ? `mailto:${profile.links.email}`
                    : profile.links[key],
            track: analytics.contact[key],
            // The résumé is counted with the hero's button, told apart by "from"
            trackFrom: key === 'resume' ? 'contact' : undefined
        }));

    renderedCallback() {
        // Browser only, once: clicks bubble up to here from every section
        if (!this._listening) {
            this._listening = true;
            this.addEventListener('click', trackClick);
        }
    }

    disconnectedCallback() {
        this.removeEventListener('click', trackClick);
        this._listening = false;
    }
}
