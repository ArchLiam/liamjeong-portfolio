import { LightningElement } from 'lwc';
import { experience, ui } from 'lj/content';

/**
 * @description Experience: the career timeline, newest first. Each role shows
 * its years, the company's logo (or an initials tile), the company, the
 * title, and what the work was. Certifications have their own section
 * (lj-certifications).
 * @author Liam Jeong
 */
export default class Experience extends LightningElement {
    static renderMode = 'light';

    roles = experience;
    ui = ui;
}
