import { LightningElement, api } from 'lwc';
import { profile } from 'lj/content';

const MARKS = {
    light: '/assets/logo/logo-mark.svg',
    dark: '/assets/logo/logo-mark-dark.svg'
};

/**
 * @description Logo lockup: the LJ cube mark beside the name and role. It is
 * the on-page version of og.png, in live text so it stays crisp, matches the
 * background it sits on, and can be read by search engines and screen readers.
 * @author Liam Jeong
 */
export default class Lockup extends LightningElement {
    static renderMode = 'light';

    /** @description Background the lockup sits on: "light" (default, paper) or "dark" (ink). */
    @api variant = 'light';

    /** @description Show the domain under the role, as og.png does. Defaults to false. */
    @api showDomain = false;

    profile = profile;

    get isDark() {
        return this.variant === 'dark';
    }

    get className() {
        return this.isDark ? 'lockup lockup_dark' : 'lockup lockup_light';
    }

    get markSrc() {
        return this.isDark ? MARKS.dark : MARKS.light;
    }
}
