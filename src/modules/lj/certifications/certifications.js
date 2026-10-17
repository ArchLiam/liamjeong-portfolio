import { LightningElement } from 'lwc';
import { badges, certifications, ui } from 'lj/content';

// Fixed English month names rather than Intl, so the server and the browser
// render the same text and hydration matches
const MONTHS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

// Joins a short last word ("I", "II", "SFP") to the one before it with a
// no-break space, so a narrow card never leaves it alone on a line
const keepTail = (name) => name.replace(/ (\S{1,3})$/, '\u00a0$1');

const monthLabel = (issued) => {
    const [year, month] = issued.split('-').map(Number);
    return `${MONTHS[month - 1]} ${year}`;
};

/**
 * @description Certifications: Trailhead badges on a dark panel first, then
 * one card per issuer in the style of a Schema Builder object: the issuer's logo and name as the header and each
 * certification as a row, with its credential ID and issue date, then a link
 * to the full list on LinkedIn. A name links to its credential when the
 * content has a `url`; unknown dates and IDs are left out.
 * @author Liam Jeong
 */
export default class Certifications extends LightningElement {
    static renderMode = 'light';

    ui = ui;
    badges = badges;

    get groups() {
        return certifications.map((group) => ({
            ...group,
            headingId: `certifications-${group.id}`,
            count: group.items.length,
            items: group.items.map((cert) => ({
                ...cert,
                name: keepTail(cert.name),
                issuedText: cert.issued ? monthLabel(cert.issued) : ''
            }))
        }));
    }

    get hasProfileUrl() {
        return Boolean(ui.certifications.profileUrl);
    }
}
