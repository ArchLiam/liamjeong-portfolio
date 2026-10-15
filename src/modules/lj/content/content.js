/**
 * Single source of truth for site copy and data.
 *
 * Everything marked DRAFT is placeholder copy for LJ to rewrite.
 * Before publishing a case study, confirm the engagement allows public
 * mention: federal programs and some primes restrict naming the
 * client or program. Keep client names generic until cleared.
 */

export const profile = {
    name: 'Liam Jeong',
    knownAs: 'LJ',
    role: 'Salesforce Architect',
    location: 'Dallas–Fort Worth, Texas',
    headline: 'An architect who still writes the Apex.',
    intro: 'I design and build Salesforce for public-sector and regulated work: Agentforce on GovCloud, OmniStudio and Revenue Cloud, and the integrations and deployment pipelines underneath.',
    availability: 'Open to architect and lead developer roles.',
    links: {
        github: 'https://github.com/ArchLiam',
        linkedin: '', // TODO: add LinkedIn profile URL
        email: '', // TODO: add once a mailbox exists on liamjeong.com
        resume: '' // TODO: add /assets/LiamJeong-Resume.pdf
    }
};

// Interface copy: navigation, section headings, labels, and link text.
export const ui = {
    // Starts with "LJ", the letters in the logo, so voice-control users can say what they see.
    homeLinkLabel: 'LJ, Liam Jeong, home',
    navLabel: 'Primary',
    nav: [
        { href: '#work', label: 'Work' },
        { href: '#experience', label: 'Experience' },
        { href: '#contact', label: 'Contact' }
    ],
    proofLabel: 'What I bring',
    hero: {
        primaryAction: 'See selected work',
        secondaryAction: 'Get in touch'
    },
    work: {
        title: 'Selected work',
        lede: 'Client names are generalized where engagements require it. Open a case to see the constraints and the decisions behind it.',
        fields: {
            context: 'Context',
            constraints: 'Constraints',
            decision: 'Decision',
            outcome: 'Outcome'
        }
    },
    experience: {
        title: 'Experience',
        verifyLink: 'Verify credentials on Trailhead'
    },
    contact: {
        body: `Based in ${profile.location}. The fastest way to reach me is below.`,
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
        sourceUrl: 'https://github.com/ArchLiam/liamjeong-portfolio'
    }
};

// DRAFT: three proof points, each one sentence a hiring manager can verify.
export const proofPoints = [
    {
        id: 'agentforce',
        title: 'Agentforce in a regulated cloud',
        body: 'Building an Agentforce pilot on Salesforce GovCloud for a federal program, where every feature is weighed against what the environment actually supports.'
    },
    {
        id: 'quote',
        title: 'Pricing and quote generation',
        body: 'OmniStudio and Revenue Cloud work spanning pricing procedures, quote pipelines, and document generation.'
    },
    {
        id: 'public-sector',
        title: 'Public-sector modernization',
        body: 'Licensing and permitting-style workloads at Deloitte, including team leadership on federal and state programs.'
    }
];

// DRAFT: case studies. Fill context/constraints/decision/outcome from real work.
// Outcomes must be real and cleared; leave TODO rather than estimate.
export const caseStudies = [
    {
        id: 'govcloud-agentforce',
        title: 'An Agentforce pilot on GovCloud',
        client: 'U.S. federal program',
        year: '2026',
        tags: ['Agentforce', 'GovCloud', 'Data Cloud'],
        context:
            'A federal program piloting AI agents for internal service workflows.',
        constraints:
            'GovCloud feature availability, FedRAMP boundaries, and data that cannot leave the authorized environment.',
        decision:
            'TODO: the architectural choice you made and what you ruled out.',
        outcome: 'TODO: cleared, measurable result.'
    },
    {
        id: 'quote-pipeline',
        title: 'A quote pipeline on OmniStudio and Revenue Cloud',
        client: 'B2B software company',
        year: '2026',
        tags: ['OmniStudio', 'Revenue Cloud', 'Doc Gen'],
        context:
            'Pricing and quote documents needed to come from one governed pipeline.',
        constraints:
            'Complex pricing rules, document templates owned by another team, and a fixed go-live.',
        decision: 'TODO',
        outcome: 'TODO'
    },
    {
        id: 'flow-migration',
        title: 'Process Builder to Flow, at scale',
        client: 'Global consultancy engagement',
        year: 'TODO',
        tags: ['Flow', 'Batch Apex', 'Migration'],
        context: 'A large org retiring Process Builder before end of support.',
        constraints:
            'Hundreds of automations with order-of-execution dependencies nobody had documented.',
        decision: 'TODO',
        outcome: 'TODO'
    }
];

// A real sequence, so it renders as an ordered timeline.
// TODO: confirm years for each role.
export const experience = [
    {
        id: 'sprezzatura',
        org: 'Sprezzatura Management Consulting',
        role: 'Senior Salesforce Developer, federal Agentforce pilot',
        period: '2026 to present'
    },
    {
        id: 'coastal',
        org: 'Coastal Cloud',
        role: 'OmniStudio Developer (contract)',
        period: '2026'
    },
    {
        id: '5s',
        org: '5S Infusion Corp',
        role: 'Founder and Salesforce Architect',
        period: '2022 to present'
    },
    {
        id: 'aaa',
        org: 'AAA',
        role: 'Salesforce Developer, CI/CD with Gearset and GitHub',
        period: 'TODO'
    },
    {
        id: 'deloitte',
        org: 'Deloitte',
        role: 'Public-sector Salesforce modernization and team lead',
        period: 'TODO'
    },
    {
        id: 'publicis',
        org: 'Publicis Sapient',
        role: 'Batch Apex and Process Builder to Flow migration',
        period: 'TODO'
    },
    {
        id: 'direct-trucking',
        org: 'Direct Trucking',
        role: 'VB.NET developer and first Salesforce admin role',
        period: 'TODO'
    }
];

export const credentials = {
    summary:
        'Eight Salesforce certifications, Copado Fundamentals I and II, Trailhead All-Star Ranger, Agentblazer 2025 and 2026.',
    // TODO: link to your Trailhead or Credly profile
    verifyUrl: ''
};

/**
 * Hero diagram: a Schema Builder-style map of the platform areas LJ works in.
 * Coordinates are in the SVG's 560 x 440 viewBox. `focus` marks the node
 * the intro animation lands on.
 */
export const schema = {
    title: 'Platform areas I work across',
    // Keep in step with the nodes below; screen readers get this instead of the drawing.
    description:
        'A schema-style diagram with the Salesforce platform core connected to Agentforce, Data Cloud, OmniStudio, Revenue Cloud, the release pipeline, and integrations.',
    nodes: [
        {
            id: 'core',
            label: 'Platform core',
            sub: 'Apex, LWC, Flow',
            x: 214,
            y: 194
        },
        {
            id: 'agentforce',
            label: 'Agentforce',
            sub: 'Agents, topics, actions',
            x: 24,
            y: 40,
            focus: true
        },
        {
            id: 'datacloud',
            label: 'Data Cloud',
            sub: 'Grounding',
            x: 404,
            y: 40
        },
        {
            id: 'omni',
            label: 'OmniStudio',
            sub: 'IPs, DataMappers',
            x: 24,
            y: 348
        },
        {
            id: 'rlm',
            label: 'Revenue Cloud',
            sub: 'Pricing, quotes',
            x: 404,
            y: 348
        },
        {
            id: 'cicd',
            label: 'Release pipeline',
            sub: 'Copado, Gearset',
            x: 214,
            y: 22
        },
        {
            id: 'integrations',
            label: 'Integrations',
            sub: 'APIs, events',
            x: 214,
            y: 366
        }
    ],
    edges: [
        ['core', 'agentforce'],
        ['core', 'datacloud'],
        ['agentforce', 'datacloud'],
        ['core', 'omni'],
        ['core', 'rlm'],
        ['omni', 'rlm'],
        ['core', 'cicd'],
        ['core', 'integrations']
    ]
};

export const NODE_WIDTH = 132;
export const NODE_HEIGHT = 54;
