export interface JobPosting {
  id: string | number;
  title: string;
  company: string;
  location: string;
  exp: string;
  type: string;
  salary: string;
  education?: string;
  skills: string[];
  desc: string;
  reqs: string;
  mcpId: string;
  applyUrl?: string;
}

export interface SkillDemand {
  name: string;
  pct: number;
  ratio: string;
}

export interface RoleData {
  jobsCount: string;
  companiesCount: string;
  locations: string;
  experience: string;
  insight: string;
  disclaimer: string;
  skills: SkillDemand[];
  reqEducation: string;
  reqExperience: string;
  reqTech: string;
  reqProf: string;
  jobs: JobPosting[];
  relatedRoles: {
    title: string;
    overlap: string;
    focus: string;
  }[];
}

export const roleDatastore: Record<string, RoleData> = {
  'Data Analyst': {
    jobsCount: '28',
    companiesCount: '19',
    locations: 'Hybrid / London & Remote',
    experience: '2-4 yrs',
    insight:
      'The retrieved Data Analyst postings show strong demand for analytical skills, with Excel, SQL and data visualisation appearing frequently. Many of the sampled opportunities are suitable for early-career candidates, although experience requirements vary by employer.',
    disclaimer:
      'Synthesis strictly derived from 28 retrieved JobDataLake postings • Sample does not represent entire global market.',
    skills: [
      { name: 'SQL', pct: 82, ratio: '23/28 postings' },
      { name: 'Excel', pct: 75, ratio: '21/28 postings' },
      { name: 'Python', pct: 57, ratio: '16/28 postings' },
      { name: 'Power BI', pct: 46, ratio: '13/28 postings' },
      { name: 'Tableau', pct: 39, ratio: '11/28 postings' },
      { name: 'Data Modeling', pct: 32, ratio: '9/28 postings' },
    ],
    reqEducation:
      'BSc in Computer Science, STEM, Economics or equivalent analytical experience commonly requested (64% of postings).',
    reqExperience:
      'Mid/Associate level (2-3 years) predominates, with 25% of postings welcoming Junior/Graduate candidates with portfolio projects.',
    reqTech:
      'SQL (PostgreSQL/BigQuery), Python (pandas), Excel (Advanced/VBA), Power BI, ETL pipelines, Git.',
    reqProf:
      'Stakeholder presentation, business acumen, cross-functional collaboration, problem decomposition, data storytelling.',
    jobs: [
      {
        id: '1',
        title: 'Senior Data Analyst',
        company: 'FinTech Global',
        location: 'London (Hybrid)',
        exp: '3-5 yrs',
        type: 'Full-time',
        salary: '£55,000 - £65,000',
        education: 'BSc Quantitative / STEM',
        skills: ['SQL', 'Python', 'BigQuery', 'Looker', 'dbt'],
        desc: 'Leading end-to-end data pipeline transformations, delivering commercial reporting models, and presenting analytics to enterprise stakeholders.',
        reqs: '3+ years relevant analytics experience. Degree in Quantitative/STEM domain or verified professional portfolio.',
        mcpId: '#JDL-8291',
        applyUrl: 'https://jobdatalake.com/jobs/8291',
      },
      {
        id: '2',
        title: 'Junior Data Operations Analyst',
        company: 'HealthMetrics',
        location: 'Remote UK',
        exp: '0-2 yrs',
        type: 'Full-time',
        salary: '£32,000 - £38,000',
        education: 'BSc or BootCamp Portfolio',
        skills: ['Excel', 'SQL Fundamentals', 'Data Hygiene', 'Tableau'],
        desc: 'Supporting the medical operational dataset, validating data pipelines, cleaning clinic feedback payloads, and assisting with weekly analytics boards.',
        reqs: 'Early-career role suitable for graduate with strong analytical interest and proven proficiency in Excel (pivot tables, lookups) and basic SQL.',
        mcpId: '#JDL-8304',
        applyUrl: 'https://jobdatalake.com/jobs/8304',
      },
      {
        id: '3',
        title: 'Business Intelligence Analyst',
        company: 'RetailStream',
        location: 'Manchester',
        exp: '2-4 yrs',
        type: 'Permanent',
        salary: 'Not stated',
        education: 'BSc in Business/Analytics',
        skills: ['Power BI', 'DAX', 'SQL Server', 'ETL'],
        desc: 'Design and implement commercial reporting dashboards for multi-channel retail operations. Align with regional directors on stock and supply KPIs.',
        reqs: 'Demonstrated experience building enterprise Power BI models with DAX and connecting to relational SQL datastores.',
        mcpId: '#JDL-8349',
        applyUrl: 'https://jobdatalake.com/jobs/8349',
      },
      {
        id: '4',
        title: 'Product Data Analyst',
        company: 'CloudScale AI',
        location: 'Bristol (Hybrid)',
        exp: '2+ yrs',
        type: 'Contract',
        salary: 'Competitive / Not stated',
        education: 'Degree or equivalent practice',
        skills: ['Amplitude', 'Mixpanel', 'SQL', 'A/B Testing'],
        desc: 'Partner with product managers to map user funnels, design and evaluate A/B feature tests, and identify drop-off anomalies across the core SaaS product.',
        reqs: '2+ years product analytics experience in high-growth digital environments. Strong foundation in hypothesis testing and behavioral metrics.',
        mcpId: '#JDL-8380',
        applyUrl: 'https://jobdatalake.com/jobs/8380',
      },
    ],
    relatedRoles: [
      {
        title: 'Business Intelligence Analyst',
        overlap: '89% skill overlap',
        focus: 'Reporting focus',
      },
      {
        title: 'Data Engineer',
        overlap: '76% skill overlap',
        focus: 'Architecture focus',
      },
      {
        title: 'Analytics Engineer',
        overlap: '84% skill overlap',
        focus: 'dbt & Warehousing',
      },
      {
        title: 'Marketing Analytics Specialist',
        overlap: '81% skill overlap',
        focus: 'Attribution focus',
      },
    ],
  },
  'Digital Marketing': {
    jobsCount: '34',
    companiesCount: '26',
    locations: 'London & Manchester (Hybrid)',
    experience: '1-3 yrs',
    insight:
      'Digital Marketing vacancies emphasize direct conversion telemetry, Paid Media (Meta/Google Ads), and marketing automation platforms. Postings show accelerated demand for data-informed performance analysts.',
    disclaimer:
      'Synthesis strictly derived from 34 retrieved JobDataLake postings • Sample does not represent entire global market.',
    skills: [
      { name: 'Google Analytics 4', pct: 88, ratio: '30/34 postings' },
      { name: 'SEO & Content', pct: 79, ratio: '27/34 postings' },
      { name: 'Meta Ads Manager', pct: 70, ratio: '24/34 postings' },
      { name: 'HubSpot / Marketo', pct: 52, ratio: '18/34 postings' },
      { name: 'Copywriting', pct: 44, ratio: '15/34 postings' },
      { name: 'Looker Studio', pct: 38, ratio: '13/34 postings' },
    ],
    reqEducation:
      'Marketing, Communications, or Business degree common (52%), with equivalent practical campaign track record highly valued.',
    reqExperience:
      'Junior to Mid roles dominate (1-3 yrs), with emphasis on documented ROAS performance and hands-on CMS experience.',
    reqTech:
      'GA4, Google Tag Manager, Search Console, Semrush, Meta Business Suite, Canva, Figma.',
    reqProf:
      'Creative ideation, audience persona empathy, multi-stakeholder project pacing, and commercial acumen.',
    jobs: [
      {
        id: 'dm-1',
        title: 'Growth Marketing Manager',
        company: 'VentureSprint',
        location: 'London (Hybrid)',
        exp: '2-4 yrs',
        type: 'Full-time',
        salary: '£48,000 - £56,000',
        education: 'BSc Marketing / Media',
        skills: ['GA4', 'Meta Ads', 'SEO', 'HubSpot'],
        desc: 'Orchestrating high-velocity acquisition funnels, testing creative hooks, and scaling paid search and paid social campaigns.',
        reqs: '2+ years scaling performance marketing channels with proven ROAS measurement.',
        mcpId: '#JDL-9102',
      },
      {
        id: 'dm-2',
        title: 'SEO & Content Strategist',
        company: 'BrandNexus',
        location: 'Remote UK',
        exp: '1-3 yrs',
        type: 'Full-time',
        salary: '£35,000 - £42,000',
        education: 'BA English or Communications',
        skills: ['Ahrefs', 'Semrush', 'Technical SEO', 'Contentful'],
        desc: 'Conducting keyword landscape audits, content gap analysis, and coordinating on-page schema optimizations.',
        reqs: 'Demonstrated experience growing organic search impressions and ranking in competitive verticals.',
        mcpId: '#JDL-9144',
      },
    ],
    relatedRoles: [
      {
        title: 'Performance Media Buyer',
        overlap: '92% skill overlap',
        focus: 'Paid Ads focus',
      },
      {
        title: 'Product Marketing Manager',
        overlap: '78% skill overlap',
        focus: 'Positioning & Launch',
      },
      {
        title: 'Content Marketing Specialist',
        overlap: '85% skill overlap',
        focus: 'Inbound SEO',
      },
      {
        title: 'CRM Automation Specialist',
        overlap: '73% skill overlap',
        focus: 'Lifecycle retention',
      },
    ],
  },
  'Business Analyst': {
    jobsCount: '22',
    companiesCount: '17',
    locations: 'UK Remote / Birmingham',
    experience: '3-5 yrs',
    insight:
      'Business Analyst requirements centre on translating complex commercial workflows into technical roadmaps. Heavy emphasis on Agile user story authoring, BPMN diagrams, and executive stakeholder alignment.',
    disclaimer:
      'Synthesis strictly derived from 22 retrieved JobDataLake postings • Sample does not represent entire global market.',
    skills: [
      { name: 'Process Modeling (BPMN)', pct: 86, ratio: '19/22 postings' },
      { name: 'User Stories & JIRA', pct: 81, ratio: '18/22 postings' },
      { name: 'SQL Queries', pct: 68, ratio: '15/22 postings' },
      { name: 'Stakeholder Workshops', pct: 64, ratio: '14/22 postings' },
      { name: 'Gap Analysis', pct: 54, ratio: '12/22 postings' },
      { name: 'Confluence', pct: 45, ratio: '10/22 postings' },
    ],
    reqEducation:
      'BSc in Information Systems, Business Administration, or certified IIBA / BCS qualification requested in 59% of vacancies.',
    reqExperience:
      'predominantly Mid/Senior level (3-5 years) with experience driving software transition milestones.',
    reqTech: 'JIRA, Confluence, Visio, Miro, SQL, Power BI, Excel Modeling.',
    reqProf:
      'Workshop facilitation, requirement conflict negotiation, executive conciseness, structured questioning.',
    jobs: [
      {
        id: 'ba-1',
        title: 'Senior Systems Business Analyst',
        company: 'LogisticsForward',
        location: 'Birmingham (Hybrid)',
        exp: '4+ yrs',
        type: 'Permanent',
        salary: '£52,000 - £60,000',
        education: 'BSc Information Systems',
        skills: ['BPMN', 'JIRA', 'SQL', 'Agile Scrum'],
        desc: 'Analyzing supply chain operational bottlenecks, mapping future state architecture, and eliciting functional specs.',
        reqs: '4+ years authoring epics and user stories for enterprise ERP and WMS modernization.',
        mcpId: '#JDL-8831',
      },
    ],
    relatedRoles: [
      {
        title: 'Product Owner',
        overlap: '88% skill overlap',
        focus: 'Backlog prioritization',
      },
      {
        title: 'Scrum Master',
        overlap: '74% skill overlap',
        focus: 'Agile coaching',
      },
      {
        title: 'Operations Strategist',
        overlap: '79% skill overlap',
        focus: 'Process redesign',
      },
      {
        title: 'IT Project Manager',
        overlap: '83% skill overlap',
        focus: 'Delivery governance',
      },
    ],
  },
  'Software Developer': {
    jobsCount: '45',
    companiesCount: '31',
    locations: 'Fully Remote / London',
    experience: '2-5 yrs',
    insight:
      'Software Developer roles show strong preference for full-stack TypeScript/React ecosystems paired with Node.js or Python backend microservices. Cloud orchestration and CI/CD capabilities remain universal prerequisites.',
    disclaimer:
      'Synthesis strictly derived from 45 retrieved JobDataLake postings • Sample does not represent entire global market.',
    skills: [
      { name: 'TypeScript / JavaScript', pct: 91, ratio: '41/45 postings' },
      { name: 'React / Next.js', pct: 77, ratio: '35/45 postings' },
      { name: 'Node.js / Python', pct: 71, ratio: '32/45 postings' },
      { name: 'Git & CI/CD', pct: 67, ratio: '30/45 postings' },
      { name: 'AWS / Cloud Infra', pct: 55, ratio: '25/45 postings' },
      { name: 'Docker / K8s', pct: 42, ratio: '19/45 postings' },
    ],
    reqEducation:
      'BSc in Computer Science or Software Engineering requested in 48% of postings; production GitHub repos valued equally.',
    reqExperience:
      '2-4 years professional development experience in modern codebases with unit testing compliance.',
    reqTech:
      'TypeScript, React, Node, PostgreSQL, Redis, Docker, Jest, GitHub Actions.',
    reqProf:
      'Code review diligence, async engineering communication, architectural decomposition, and debug persistence.',
    jobs: [
      {
        id: 'sd-1',
        title: 'Full Stack TypeScript Engineer',
        company: 'Novus Systems',
        location: 'Remote UK',
        exp: '3-5 yrs',
        type: 'Full-time',
        salary: '£60,000 - £75,000',
        education: 'BSc CompSci or equivalent',
        skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        desc: 'Building high throughput client applications and microservices using clean architectural patterns.',
        reqs: 'Demonstrated mastery of React state management, typed backend APIs, and distributed cloud deployments.',
        mcpId: '#JDL-7721',
      },
    ],
    relatedRoles: [
      {
        title: 'Frontend Engineer',
        overlap: '94% skill overlap',
        focus: 'UI/UX & Performance',
      },
      {
        title: 'Backend Systems Engineer',
        overlap: '88% skill overlap',
        focus: 'APIs & Microservices',
      },
      {
        title: 'DevOps / Platform Engineer',
        overlap: '76% skill overlap',
        focus: 'CI/CD & Cloud Infra',
      },
      {
        title: 'Mobile App Developer',
        overlap: '80% skill overlap',
        focus: 'React Native / Swift',
      },
    ],
  },
};
