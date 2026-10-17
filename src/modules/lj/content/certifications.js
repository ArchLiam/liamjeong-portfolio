/**
 * Certifications shown on the site, re-exported through lj/content, grouped by
 * issuer and listed newest first within each group.
 *
 * - `name` drops the "Salesforce Certified" / "Copado Certified" prefix; the
 *   issuer heading says it.
 * - `issued` is year-month (`2026-02`), shown as "Feb 2026" in a <time>
 *   element. Leave it '' when unknown; never guess a date.
 * - `credentialId` is the ID on the certificate, as on LinkedIn.
 * - Add `url` (the LinkedIn "Show credential" target) to make the name a link.
 * - `logo` is the issuer's logo, cropped to its edges, as a WebP in
 *   src/assets/img/issuers/ at twice the 32px display height. `width` and
 *   `height` are the display size. LJ chose to show the logos (2026-10-16);
 *   the README credits them as their owners' trademarks.
 * - Copado names keep LinkedIn's acronyms (SFP, MP), as LJ asked.
 */
export const certifications = [
    {
        id: 'salesforce',
        issuer: 'Salesforce',
        logo: {
            src: '/assets/img/issuers/salesforce.webp',
            width: 46,
            height: 32
        },
        items: [
            {
                id: 'platform-developer-ii',
                name: 'Platform Developer II',
                issued: '2026-02',
                credentialId: '7475913'
            },
            {
                id: 'agentforce-specialist',
                name: 'Agentforce Specialist',
                issued: '2025-10',
                credentialId: '6819248'
            },
            {
                id: 'omnistudio-consultant',
                name: 'OmniStudio Consultant',
                issued: '2024-09',
                credentialId: '4931820'
            },
            {
                id: 'omnistudio-developer',
                name: 'OmniStudio Developer',
                issued: '2021-03',
                credentialId: '428374'
            },
            {
                id: 'javascript-developer-i',
                name: 'JavaScript Developer I',
                issued: '2020-07',
                credentialId: '231753'
            },
            {
                id: 'platform-app-builder',
                name: 'Platform App Builder',
                issued: '2020-05',
                credentialId: '258190'
            },
            {
                id: 'administrator',
                name: 'Administrator',
                issued: '2020-05',
                credentialId: '200056'
            },
            {
                id: 'platform-developer-i',
                name: 'Platform Developer I',
                issued: '2020-02',
                credentialId: '1011242'
            }
        ]
    },
    {
        id: 'copado',
        issuer: 'Copado',
        logo: {
            src: '/assets/img/issuers/copado.webp',
            width: 32,
            height: 32
        },
        items: [
            {
                id: 'copado-essentials-plus',
                name: 'Copado Essentials+',
                issued: '2026-07',
                credentialId: '077282'
            },
            {
                id: 'extension-builder',
                name: 'Extension Builder',
                issued: '2026-07',
                credentialId: '077275'
            },
            {
                id: 'copado-ai',
                name: 'Copado AI',
                issued: '2026-06',
                credentialId: '069853'
            },
            {
                id: 'copado-robotic-testing',
                name: 'Copado Robotic Testing',
                issued: '2026-06',
                credentialId: '069856'
            },
            {
                id: 'fundamentals-ii-sfp',
                name: 'Fundamentals II: SFP',
                issued: '2026-06',
                credentialId: '069852'
            },
            {
                id: 'fundamentals-ii-mp',
                name: 'Fundamentals II: MP',
                issued: '2026-06',
                credentialId: '069848'
            },
            {
                id: 'fundamentals-i-sfp',
                name: 'Fundamentals I: SFP',
                issued: '2026-06',
                credentialId: '069850'
            },
            {
                id: 'fundamentals-i-mp',
                name: 'Fundamentals I: MP',
                issued: '2026-05',
                credentialId: '069140'
            }
        ]
    }
];

/**
 * Trailhead recognition shown above the certification cards. `image` is a
 * transparent WebP in src/assets/img/badges/, cropped to its edges from LJ's
 * Trailhead profile; `width` and `height` are the display size (80px tall).
 */
export const badges = [
    {
        id: 'all-star-ranger',
        name: 'All Star Ranger',
        detail: "Trailhead's highest rank",
        image: {
            src: '/assets/img/badges/all-star-ranger.webp',
            width: 101,
            height: 80
        }
    },
    {
        id: 'agentblazer-legend',
        name: 'Agentblazer Legend',
        detail: 'Highest Agentblazer level, 2025 and 2026',
        image: {
            src: '/assets/img/badges/agentblazer-legend.webp',
            width: 118,
            height: 80
        }
    }
];
