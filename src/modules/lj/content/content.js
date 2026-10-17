/**
 * Single source of truth for site copy and data.
 *
 * Everything marked DRAFT or TODO is a placeholder for LJ to fill in.
 * Before naming a new client or program, confirm the engagement allows public
 * mention: federal programs and some primes restrict it. Keep names generic
 * until cleared.
 */

export const profile = {
    name: 'Liam Jeong',
    knownAs: 'LJ',
    role: 'Salesforce Architect',
    domain: 'liamjeong.com',
    location: 'Dallas–Fort Worth, Texas',
    headline: 'An architect who still writes the code.',
    intro: 'I design and build Salesforce for public-sector and regulated work: Agentforce on GovCloud, OmniStudio and Data 360, and the integrations and deployment pipelines underneath.',
    availability: 'Open to architect and lead developer roles.',
    links: {
        github: 'https://github.com/ArchLiam',
        linkedin: 'https://www.linkedin.com/in/liam-seonghwa-jeong/',
        email: 'arch.liam.jeong@gmail.com',
        // Replace the file to update it; keep the name so links stay valid
        resume: '/assets/resume/liam-jeong-resume.pdf'
    }
};

// Interface copy: navigation, section headings, labels, and link text.
export const ui = {
    // Starts with "LJ", the letters in the logo, so voice-control users can say what they see.
    homeLinkLabel: 'LJ, Liam Jeong, home',
    navLabel: 'Primary',
    nav: [
        { href: '#projects', label: 'Projects' },
        { href: '#experience', label: 'Experience' },
        { href: '#certifications', label: 'Certifications' },
        { href: '#contact', label: 'Contact' }
    ],
    hero: {
        primaryAction: 'Projects',
        // Says the file type, so nobody is surprised by a download
        resumeAction: 'Download résumé (PDF)',
        // The name the file saves under
        resumeFileName: 'Liam-Jeong-Resume.pdf',
        secondaryAction: 'Get in touch'
    },
    diagram: {
        // Shown under the diagram until a card is selected; then the selected
        // card's `summary` (in the schema below) takes its place
        hint: 'Tap or click a card to trace its connections.'
    },
    recommendations: {
        title: 'Recommendations',
        lede: 'Excerpts from recommendations colleagues wrote for me on LinkedIn.',
        allLabel: 'Read them in full on LinkedIn',
        pickerLabel: 'Choose a recommendation',
        previous: 'Previous recommendation',
        next: 'Next recommendation',
        allUrl: 'https://www.linkedin.com/in/liam-seonghwa-jeong/details/recommendations/'
    },
    projects: {
        title: 'Projects',
        lede: 'Salesforce work for federal, state, and enterprise clients.'
    },
    experience: {
        title: 'Experience'
    },
    education: {
        title: 'Education',
        gradeLabel: 'GPA',
        activitiesLabel: 'Activities:'
    },
    certifications: {
        title: 'Certifications',
        lede: 'Trailhead standing, then every Salesforce and Copado certification, newest first.',
        badgesTitle: 'Trailhead',
        profileLabel: 'Trailblazer profile',
        // The public handle URL. The bare /trailblazer/profile address opens
        // the visitor's own profile (or a sign-in page), so never use that.
        profileUrl: 'https://www.salesforce.com/trailblazer/devliamjeong',
        // Screen reader text before each date; the date alone reads ambiguously
        issuedLabel: 'Issued',
        idLabel: 'Credential ID',
        allLabel: 'See the credentials on LinkedIn',
        allUrl: 'https://www.linkedin.com/in/liam-seonghwa-jeong/details/certifications/'
    },
    contact: {
        body: `Based in ${profile.location}. The fastest way to reach me is below.`,
        photoAlt: 'Liam Jeong',
        // Rendered in this order; a link appears only when profile.links has its URL.
        links: {
            email: 'Email',
            linkedin: 'LinkedIn',
            github: 'GitHub',
            resume: 'Résumé (PDF)'
        }
    },
    footer: {
        // A fixed year keeps the server-rendered and hydrated footer identical.
        // It is the year of first publication; extend it to a range when updating.
        text: '© 2026 Liam Jeong. Built with Lightning Web Components and SLDS.',
        sourceLabel: 'View the source',
        // The SLDS icon credit (CC BY-ND 4.0) lives in the README's Credits
        // section, which this link leads to. Don't remove both.
        sourceUrl: 'https://github.com/ArchLiam/liamjeong-portfolio',
        // "Built to", not "complies with": a conformance claim needs a full
        // audit, including manual screen reader testing.
        accessibilityText: 'Built to',
        accessibilityLabel: 'WCAG 2.2 AA',
        accessibilityUrl: 'https://www.w3.org/TR/WCAG22/'
    }
};

// Recommendations (long, verbatim quotes) and certifications live in their own
// files; components still import them from lj/content.
export { recommendations } from './recommendations';
export { badges, certifications } from './certifications';

/**
 * Projects, in the order shown on the page, as rows that fold open. The row
 * shows the title, program (if any), client, role, and tags; opening it shows
 * the one-sentence `summary` and the `highlights`. No dates, by LJ's choice.
 *
 * - LJ confirmed (2026-10-16) that these clients and programs may be named.
 *   Ask again before naming a new one: federal programs and some primes
 *   restrict it.
 * - Metrics are LJ's own; never round, estimate, or add to them.
 * - Product names follow the site: Data 360, not Data Cloud. No arrows in
 *   text (screen readers say "right arrow"). The projects test checks both.
 */
export const projects = [
    {
        id: 'omega',
        title: 'Agentforce pilot on GovCloud',
        program: 'OMEGA Project',
        client: 'U.S. Department of Veterans Affairs',
        role: 'Lead Salesforce Developer',
        tags: ['Agentforce', 'GovCloud', 'Data 360', 'LWC', 'Copado'],
        summary:
            "Architected and shipped a conversational Agentforce Employee Agent on Salesforce GovCloud: Flow-based agent actions, Flex prompt templates, and planner-bundle topic routing, delivered through the VA's architecture and security review gates inside a FedRAMP High boundary.",
        highlights: [
            'Raised generative-AI output accuracy from 86% to 98% across six controlled prompt-template iterations by turning qualitative model judgments into deterministic, stepwise text-processing logic.',
            "Led the Agentforce monitoring and observability workstream: designed a three-layer application-monitoring architecture (real-time on-platform logging, session-keyed user feedback, and scheduled Data 360 extraction into app-owned objects) and wrote the System Integrator guidance that filled in the application-monitoring section of the pilot's High-Level Design.",
            'Produced a Data 360 data dictionary of 25 objects and 458 fields, with validated SOQL queries mapping every Agent Analytics KPI to its source DMO.',
            'Reduced projected LLM credit consumption by tightening agent topic scoping and adding action-level clarification prompts, eliminating unnecessary model invocations.',
            "Led the team's compliance standards for each metadata type (Agentforce, Apex, Flow, Permission Sets) and delivered all work through the Copado pipeline, from DEV to SIT to Full, under pull-request and architect-approval gates, leading user-story bundling and a successful release to the Full sandbox."
        ]
    },
    {
        id: 'aaa-integrations',
        title: 'Mapping API platform and exception framework',
        program: '',
        client: 'AAA Auto Club Enterprises',
        role: 'Senior Salesforce Developer',
        tags: ['Apex', 'LWC', 'Platform Events', 'Integrations'],
        summary:
            'Re-architected the Mapping API platform with Apex, LWC, and dynamic configuration, improving reliability and reducing integration failures with external systems.',
        highlights: [
            'Implemented a centralized exception framework (Platform Events, Queueable Apex, LWC) that creates cases automatically and speeds up root-cause analysis.'
        ]
    },
    {
        id: 'wi-amp',
        title: 'Access Modernization Project (WI AMP)',
        program: '',
        client: 'State of Wisconsin',
        role: 'LWC Developer and UX Team Lead',
        tags: ['LWC', 'SLDS', 'Accessibility'],
        summary:
            'Led the UX development team building responsive, WCAG-compliant Lightning Web Components with SLDS, modernizing legacy government UIs and improving the accessibility, usability, and performance of citizen-facing applications.',
        highlights: []
    },
    {
        id: 'oh-mmcp',
        title: 'Medicaid Managed Care Project (OH MMCP)',
        program: '',
        client: 'State of Ohio',
        role: 'Lead Salesforce Developer',
        tags: ['Government Cloud', 'Flow Orchestration', 'Data modeling'],
        summary:
            'Served as onshore technical lead on Government Cloud: implemented Flow Orchestration, designed scalable data models and schemas, led the development team, and mentored junior developers.',
        highlights: []
    },
    {
        id: 'revenue-cloud-docgen',
        title: 'Revenue Cloud document generation and e-signature',
        program: '',
        client: 'Fortra',
        role: 'Senior OmniStudio Developer',
        tags: ['OmniStudio', 'Revenue Cloud', 'DocGen', 'DocuSign'],
        summary:
            'Designed and implemented OmniStudio DocGen and DocuSign for production on Revenue Cloud.',
        highlights: []
    }
];

/**
 * Experience: a real sequence, so it renders as an ordered timeline.
 *
 * - `title` is the job title as on LinkedIn; `detail` (optional) says what the
 *   work was. `period` is in years, or '' when LJ hasn't given them; an empty
 *   value is left off the page, never guessed.
 * - `logo` is a 96px square WebP in src/assets/img/companies/ (shown at 48px),
 *   cropped from the company's LinkedIn logo on its own background. Without
 *   one, `logo` is '' and `initials` shows in a tile instead. The README
 *   credits the logos as their owners' trademarks.
 */
export const experience = [
    {
        id: 'sprezzatura',
        org: 'Sprezzatura Management Consulting',
        title: 'Lead Salesforce Developer',
        detail: 'Agentforce, Master Person Identity (MPI)',
        period: '2026 to present',
        logo: '/assets/img/companies/sprezzatura.webp'
    },
    {
        id: 'aaa',
        org: 'AAA Auto Club Enterprises',
        title: 'Senior Salesforce Developer',
        detail: 'CI/CD with Gearset and GitHub',
        period: '2025',
        logo: '/assets/img/companies/aaa.webp'
    },
    {
        id: 'deloitte',
        org: 'Deloitte',
        title: 'Solutions Specialist',
        detail: 'Public-sector Salesforce modernization and team lead',
        period: '2022 to 2025',
        logo: '/assets/img/companies/deloitte.webp'
    },
    {
        id: 'revolent',
        org: 'Revolent Group',
        title: 'Salesforce Consultant at Publicis Sapient (contract)',
        detail: 'NC ReBUILD: Process Builder to Flow migration and Batch Apex document processing',
        period: '2020 to 2022',
        logo: '/assets/img/companies/revolent.webp'
    },
    {
        id: 'direct-trucking',
        org: 'Direct Trucking Corp',
        title: 'Software Engineer',
        detail: 'VB.NET developer and first Salesforce admin role',
        period: '2016 to 2019',
        logo: '/assets/img/companies/direct-trucking.webp'
    }
];

/**
 * Education, grouped by school; each school's degrees newest first, as on
 * LinkedIn. `logo` is a 128px square WebP in src/assets/img/schools/ (shown
 * at 64px). `grade` reads as words ("4.4 out of 4.5"), since screen readers
 * say "slash" for "4.4/4.5". `honors` and `activities` are optional.
 */
export const education = [
    {
        id: 'tech-university-of-korea',
        school: 'Tech University of Korea',
        logo: '/assets/img/schools/tech-university-of-korea.webp',
        degrees: [
            {
                id: 'computer-engineering',
                field: 'Computer Engineering',
                degree: "Bachelor's degree",
                period: '2012 to 2016',
                grade: '4.4 out of 4.5',
                honors: 'Honored Student',
                activities: ''
            },
            {
                id: 'game-multimedia-engineering',
                field: 'Game & Multimedia Engineering',
                degree: "Bachelor's degree",
                period: '2009 to 2015',
                grade: '3.8 out of 4.5',
                honors: '',
                activities:
                    'Vocalist in a band and leader of a software tutoring group'
            }
        ]
    }
];

/**
 * Hero diagram: a Schema Builder-style map of the platform areas LJ works in,
 * laid out in three layers. Experiences on top (OmniStudio, Agentforce), the
 * platform in the middle (the release pipeline deploys to the platform core),
 * and data at the bottom (integrations and Data 360).
 *
 * Each card sits in a grid cell (`col` 0-2, `row` 0-2) and lists its `items`
 * one per row, like the fields on a Schema Builder object; the hero component
 * turns that into coordinates. Its `summary` is the caption shown when the
 * card is selected: it says what each of the card's lines means, so it must
 * name every card it connects to (the hero test checks), because screen
 * reader users get the lines only through this text. `focus` marks the card the intro lands on,
 * `hub` the card the others fly out of, and `icon` names an SLDS utility icon
 * in lj/icons.
 *
 * Straight connectors join cards in the same row, so no card may sit between
 * them; a line running behind a card reads as a connection to it. The hero
 * test checks this, and that the intro stays under five seconds.
 */
export const schema = {
    title: 'Platform areas I work across',
    // Keep in step with the nodes and edges below; screen readers get this instead of the drawing.
    description:
        'A Schema Builder-style diagram. A release pipeline deploys to the Salesforce platform core, which powers OmniStudio, Agentforce, and integrations and feeds Data 360. Integrations also bring outside data into Data 360, which grounds Agentforce.',
    nodes: [
        {
            id: 'omni',
            label: 'OmniStudio',
            summary:
                'OmniScripts guide the user, Integration Procedures and DataMappers move the data on the platform core, and DocGen and DocuSign turn it into signed documents.',
            items: ['OmniScript', 'IPs', 'DataMappers', 'DocuSign', 'DocGen'],
            icon: 'data_mapping',
            col: 0,
            row: 0
        },
        {
            id: 'agentforce',
            label: 'Agentforce',
            summary:
                "Agents act through Apex and Flow actions on the platform core, grounded in Data 360 so their answers come from the org's own data.",
            items: ['Agents', 'Topics', 'Actions'],
            icon: 'agent_astro',
            col: 2,
            row: 0,
            focus: true
        },
        {
            id: 'cicd',
            label: 'Release pipeline',
            summary:
                'Source lives in GitHub or Azure DevOps; Copado or Gearset promote it through environments and deploy it to the platform core.',
            items: ['Copado', 'Gearset', 'GitHub', 'Azure DevOps'],
            icon: 'merge',
            col: 0,
            row: 1
        },
        {
            id: 'core',
            label: 'Platform core',
            summary:
                'Apex, LWC, and Flow are the hub. The release pipeline deploys here, and this layer powers OmniStudio, Agentforce actions, and the integrations, and streams CRM data into Data 360.',
            items: ['Apex', 'LWC', 'Flow'],
            icon: 'apex',
            col: 1,
            row: 1,
            hub: true
        },
        {
            id: 'integrations',
            label: 'Integrations',
            summary:
                'REST and SOAP APIs and Platform Events connect the platform core to outside systems and bring their data into Data 360.',
            items: ['REST & SOAP APIs', 'Platform Events'],
            icon: 'integration',
            col: 0,
            row: 2
        },
        {
            id: 'data360',
            label: 'Data 360',
            summary:
                'Data Streams bring in CRM data from the platform core and outside data through the integrations; Identity Resolution unifies it, and Search Indexes ground Agentforce.',
            items: [
                'Data Streams',
                'Identity Resolution',
                'Search Indexes',
                'Grounding'
            ],
            icon: 'data_cloud',
            col: 2,
            row: 2
        }
    ],
    // [from, to]: connectors draw, and data pulses travel, in this direction.
    edges: [
        // The pipeline deploys metadata to the org
        ['cicd', 'core'],
        // The platform runs OmniScripts and IPs, Agentforce actions (Apex,
        // Flow), and the integration endpoints, and streams CRM data to Data 360
        ['core', 'omni'],
        ['core', 'agentforce'],
        ['core', 'integrations'],
        ['core', 'data360'],
        // Outside systems feed Data 360 through the integrations layer
        ['integrations', 'data360'],
        // Data 360 grounds Agentforce: the intro's last pulse
        ['data360', 'agentforce']
    ]
};

// Card width: fits the widest label ("Release pipeline") with 14px padding.
// Heights vary with the number of items; see the hero component.
export const NODE_WIDTH = 152;
