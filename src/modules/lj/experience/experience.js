import { LightningElement } from 'lwc';
import { experience, credentials, ui } from 'lj/content';

/**
 * @description Experience: credentials summary, an optional link to verify
 * them, and the career timeline, newest first.
 * @author Liam Jeong
 */
export default class Experience extends LightningElement {
    static renderMode = 'light';

    roles = experience;
    credentials = credentials;
    ui = ui;

    get hasVerifyUrl() {
        return Boolean(this.credentials.verifyUrl);
    }
}
