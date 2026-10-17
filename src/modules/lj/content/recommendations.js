/**
 * LinkedIn recommendations shown on the site, re-exported through lj/content.
 *
 * - `quote` is a verbatim excerpt (whole, consecutive sentences) of what the
 *   person wrote. Never edit their words; pick a different passage instead.
 *   The full text stays on LinkedIn, linked from the section.
 * - `photo` is a 96px WebP in src/assets/img/recommenders/, or null for an
 *   initials avatar. Get the person's OK before publishing their photo and
 *   words, and remove both if they ask. LJ confirmed (2026-10-16) that
 *   everyone below agreed and that each photo is the right person.
 * - `relationship` restates LinkedIn's own line ("X managed Liam directly").
 */
export const recommendations = [
    {
        id: 'nicholas-melcher',
        name: 'Nicholas Melcher',
        title: 'Salesforce Product Maker/Deloitte Senior Consultant | USAF Veteran',
        relationship: 'Worked with Liam on the same team',
        date: 'April 2025',
        photo: '/assets/img/recommenders/nicholas-melcher.webp',
        quote: 'In our project, he led the redesign of a legacy implementation, creating a cohesive user experience and significantly improving performance. His code is clean, well-documented, and thoughtfully structured—making it easy for the entire team to collaborate and scale on top of his work.'
    },
    {
        id: 'natalie-moey',
        name: 'Natalie Moey',
        title: 'Senior Product Design Lead (UX/UI) at Deloitte',
        relationship: 'Worked with Liam on the same team',
        date: 'April 2025',
        photo: null,
        quote: "His technical expertise was exceptional - he was easily one of the best front-end developers I've worked with, combining strong implementation skills with a deep understanding of how to bring designs to life accurately and efficiently."
    },
    {
        id: 'john-gruenbacher',
        name: 'John Gruenbacher',
        title: 'Senior Manager at Deloitte Consulting',
        relationship: "Senior to Liam but didn't manage him directly",
        date: 'April 2025',
        photo: '/assets/img/recommenders/john-gruenbacher.webp',
        quote: "Liam's expertise in developing responsive Lightning Web Components (LWC) was exceptional, and his contributions significantly enhanced our projects. Liam demonstrated a sincere commitment to web accessibility, prioritizing WCAG standards to ensure our websites were usable by all populations."
    },
    {
        id: 'akosa-okwudiafor',
        name: 'Akosa Okwudiafor',
        title: 'Salesforce Application Architect / Salesforce Consultant',
        relationship: 'Managed Liam directly',
        date: 'April 2025',
        photo: '/assets/img/recommenders/akosa-okwudiafor.webp',
        quote: 'He demonstrated several moments of selflessness and thinking outside the box by ensuring the components and utilities he built could be used by other people on the team.'
    },
    {
        id: 'arjun-grover',
        name: 'Arjun Grover',
        title: 'Consultant at Deloitte',
        relationship: 'Worked with Liam on the same team',
        date: 'April 2025',
        photo: '/assets/img/recommenders/arjun-grover.webp',
        quote: "Liam is one of the most positive people I have ever had the pleasure of working with, he is hardworking, and doesn't leave a task unfinished."
    }
];
