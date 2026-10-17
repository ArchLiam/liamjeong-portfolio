import { LightningElement } from 'lwc';
import { education, ui } from 'lj/content';

/**
 * @description Education: each school with its seal and name, then its
 * degrees, newest first, with years, GPA, honors, and activities. Laid out
 * like the Experience section it follows.
 * @author Liam Jeong
 */
export default class Education extends LightningElement {
    static renderMode = 'light';

    schools = education.map((school) => ({
        ...school,
        headingId: `education-${school.id}`
    }));

    ui = ui;
}
