import { LightningElement } from 'lwc';
import { analytics, recommendations, ui } from 'lj/content';

const initialsOf = (name) =>
    name
        .split(/\s+/)
        .map((part) => part[0])
        .join('');

/**
 * @description Recommendations spotlight: one verbatim LinkedIn excerpt at a
 * time, large, with the recommenders' photos as a tab list to switch between
 * them, plus previous/next buttons. Follows the WAI-ARIA tabs pattern (arrow
 * keys, Home, End). Nothing moves on its own. Every quote is in the
 * server-rendered HTML; without JavaScript they all show, stacked.
 * @author Liam Jeong
 */
export default class Recommendations extends LightningElement {
    static renderMode = 'light';

    ui = ui;
    analytics = analytics;
    activeIndex = 0;
    status = '';
    _focusTab = false;

    get slides() {
        return recommendations.map((rec, index) => {
            const active = index === this.activeIndex;
            return {
                ...rec,
                index,
                tabKey: `${rec.id}-tab`,
                tabId: `recommendation-tab-${rec.id}`,
                panelId: `recommendation-panel-${rec.id}`,
                panelClass: active
                    ? 'recommendations__panel recommendations__panel_active'
                    : 'recommendations__panel',
                tabClass: active
                    ? 'recommendations__tab recommendations__tab_active'
                    : 'recommendations__tab',
                selected: active ? 'true' : 'false',
                tabIndex: active ? '0' : '-1',
                meta: `${rec.relationship}, ${rec.date}`,
                initials: initialsOf(rec.name)
            };
        });
    }

    // "01 / 05": decorative, since the tabs already say "2 of 5"
    get counter() {
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(this.activeIndex + 1)} / ${pad(recommendations.length)}`;
    }

    renderedCallback() {
        // Arrow keys move the selection; focus follows it to the new tab
        if (this._focusTab) {
            this._focusTab = false;
            const tab = this.querySelector(
                `[role="tab"][data-index="${this.activeIndex}"]`
            );
            if (tab) {
                tab.focus();
            }
        }
    }

    show(index) {
        const count = recommendations.length;
        this.activeIndex = (index + count) % count;
    }

    // Tabs announce themselves when focused; the arrow buttons don't move
    // focus, so they announce the new quote's author through the live region
    step(by) {
        this.show(this.activeIndex + by);
        this.status = `${recommendations[this.activeIndex].name}, ${this.activeIndex + 1} of ${recommendations.length}`;
    }

    handleTabClick(event) {
        this.status = '';
        this.show(Number(event.currentTarget.dataset.index));
    }

    handleTabKeydown(event) {
        const last = recommendations.length - 1;
        const moves = {
            ArrowRight: this.activeIndex + 1,
            ArrowLeft: this.activeIndex - 1,
            Home: 0,
            End: last
        };
        if (event.key in moves) {
            event.preventDefault();
            this.status = '';
            this._focusTab = true;
            this.show(moves[event.key]);
        }
    }

    handlePrevious() {
        this.step(-1);
    }

    handleNext() {
        this.step(1);
    }
}
