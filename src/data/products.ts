export type ProductSlug =
  | "lead-follow-up-system"
  | "ai-automation-sprint"
  | "website-revenue-leak-audit";

export type ProductSummary = {
  slug: ProductSlug;
  name: string;
  description: string;
  ctaLabel: string;
  href: `/${ProductSlug}`;
};

type ProductCard = {
  title: string;
  text: string;
};

type ProductProcessStep = {
  step: string;
  title: string;
  text: string;
};

type ProductSummaryStrip = {
  bestFor: string;
  timeline: string;
  startingFrom: string;
  output: string;
};

type ProductSection = {
  title: string;
  intro: string;
};

type ProductPricing = {
  price: string;
  label: string;
  includes: string[];
  cta: string;
};

type ProductFinalCta = {
  title: string;
  text: string;
  cta: string;
};

export type ProductPageData = ProductSummary & {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  secondaryHref: string;
  summary: ProductSummaryStrip;
  problem: ProductSection & {
    cards: ProductCard[];
  };
  deliverables: ProductSection & {
    cards: ProductCard[];
  };
  process: ProductProcessStep[];
  beforeAfter: {
    before: string;
    after: string;
    exampleWorkflows?: string[];
  };
  scope: ProductSection & {
    excluded: string[];
  };
  pricing: ProductPricing;
  faq: Array<{ question: string; answer: string }>;
  finalCta: ProductFinalCta;
};

export const productSummaries: ProductSummary[] = [
  {
    slug: "lead-follow-up-system",
    name: "Lead Follow-Up System",
    description:
      "Capture, reply to, track, and chase every enquiry automatically so leads don't disappear into inboxes, DMs, and forgotten follow-ups.",
    ctaLabel: "View product",
    href: "/lead-follow-up-system",
  },
  {
    slug: "ai-automation-sprint",
    name: "AI Automation Sprint",
    description:
      "Automate one repetitive, time-hungry business process in 7-10 days using simple tools and AI where useful.",
    ctaLabel: "View product",
    href: "/ai-automation-sprint",
  },
  {
    slug: "website-revenue-leak-audit",
    name: "Website Revenue Leak Audit",
    description:
      "A 48-hour audit showing where your website, landing page, form, or checkout flow may be losing enquiries or sales.",
    ctaLabel: "View product",
    href: "/website-revenue-leak-audit",
  },
];

export const productPages: Record<ProductSlug, ProductPageData> = {
  "lead-follow-up-system": {
    ...productSummaries[0],
    metaTitle: "Lead Follow-Up System | Tom Woodhouse",
    metaDescription:
      "A 7-day setup that captures, replies to, tracks, and chases new leads automatically, so opportunities do not disappear into inboxes, DMs, and forgotten follow-ups.",
    eyebrow: "Productised service",
    title: "Stop losing enquiries after they contact you.",
    subtitle:
      "A 7-day setup that captures, replies to, tracks, and chases new leads automatically, so opportunities don't disappear into inboxes, DMs, and forgotten follow-ups.",
    primaryCta: "Get a free lead leak review",
    secondaryCta: "See what's included",
    secondaryHref: "#included",
    summary: {
      bestFor: "Service businesses losing leads after enquiry",
      timeline: "7 days",
      startingFrom: "£950",
      output: "Working follow-up system",
    },
    problem: {
      title: "Most leads are not lost because the business is bad.",
      intro:
        "They are lost because follow-up depends on busy people remembering to reply, update, chase, and check multiple inboxes.",
      cards: [
        {
          title: "Enquiries are scattered",
          text: "Leads arrive through forms, email, DMs, WhatsApp, phone, and ads with no single place to track them.",
        },
        {
          title: "Replies are too slow",
          text: "Warm leads cool down while someone finds the time to respond properly.",
        },
        {
          title: "Follow-up depends on memory",
          text: "Quotes and enquiries are easy to forget once the first reply has been sent.",
        },
        {
          title: "No clear pipeline",
          text: "It is hard to see which leads are new, open, chased, won, or lost.",
        },
      ],
    },
    deliverables: {
      title: "A simple system for handling every new enquiry.",
      intro:
        "Built to make the follow-up process clearer, faster, and harder to forget.",
      cards: [
        {
          title: "Lead-flow review",
          text: "A quick map of how enquiries currently arrive and where they can slip through.",
        },
        {
          title: "Lead tracker",
          text: "A lightweight CRM board or tracker for new, open, chased, won, and lost leads.",
        },
        {
          title: "Lead capture",
          text: "One primary enquiry source connected into the tracker.",
        },
        {
          title: "Instant acknowledgement",
          text: "An approved reply template so customers know their enquiry was received.",
        },
        {
          title: "Follow-up reminders",
          text: "Tasks, reminders, or chase prompts so leads do not go cold.",
        },
        {
          title: "Handover Loom",
          text: "A clear walkthrough showing how the system works.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Map the current enquiry flow",
        text: "We identify where leads come from and what happens after they arrive.",
      },
      {
        step: "02",
        title: "Design the follow-up system",
        text: "We decide what should be captured, replied to, tracked, and chased.",
      },
      {
        step: "03",
        title: "Build the tracker and automations",
        text: "The agreed flow is set up using lightweight tools.",
      },
      {
        step: "04",
        title: "Test the full journey",
        text: "A sample enquiry is run through the full system.",
      },
      {
        step: "05",
        title: "Handover",
        text: "You receive a Loom walkthrough and simple operating notes.",
      },
    ],
    beforeAfter: {
      before:
        "A lead submits a form, sends an email, or DMs. It lands in an inbox. Someone replies when they have time. Follow-up depends on memory.",
      after:
        "The lead is captured, acknowledged, tracked, assigned, and chased through a simple automated system.",
    },
    scope: {
      title: "Designed to stay focused.",
      intro:
        "This is not a full CRM migration, website redesign, sales training programme, or custom software build. It is a fixed setup for one clear lead follow-up flow.",
      excluded: [
        "Full CRM migration",
        "Full website redesign",
        "Paid ads setup",
        "Complex custom software",
        "Unlimited lead sources",
        "Ongoing maintenance unless separately agreed",
      ],
    },
    pricing: {
      price: "From £950",
      label: "Fixed 7-day setup",
      includes: [
        "Lead-flow review",
        "Lightweight tracker",
        "One primary lead source",
        "Instant acknowledgement",
        "Follow-up reminders",
        "Handover Loom",
      ],
      cta: "Get a free lead leak review",
    },
    faq: [
      {
        question: "Do I need a CRM?",
        answer:
          "Not necessarily. The starter version can use a lightweight tracker such as Airtable, Google Sheets, Trello, or HubSpot free.",
      },
      {
        question: "Will AI talk to my customers?",
        answer:
          "Only if agreed. The default setup uses approved templates and clear rules, not uncontrolled AI replies.",
      },
      {
        question: "What if leads come from Instagram or WhatsApp?",
        answer:
          "It depends on the account setup and tooling. If direct automation is limited, the system can still track, remind, and support manual steps.",
      },
      {
        question: "What happens if something breaks?",
        answer:
          "The system is tested before handover. Ongoing monitoring can be added as a monthly support option.",
      },
    ],
    finalCta: {
      title: "Stop letting warm enquiries go cold.",
      text: "Get a quick review of where leads might be slipping through and what a simple follow-up system could look like.",
      cta: "Get a free lead leak review",
    },
  },
  "ai-automation-sprint": {
    ...productSummaries[1],
    metaTitle: "AI Automation Sprint | Tom Woodhouse",
    metaDescription:
      "A fixed 7-10 day sprint to automate one repetitive business process using simple tools, AI, and clean workflow design.",
    eyebrow: "Productised service",
    title: "Automate the admin work that quietly eats your week.",
    subtitle:
      "A fixed 7-10 day sprint to automate one repetitive business process using simple tools, AI, and clean workflow design.",
    primaryCta: "Get a free process review",
    secondaryCta: "View example workflows",
    secondaryHref: "#before-after",
    summary: {
      bestFor: "Teams wasting hours on repetitive admin",
      timeline: "7-10 days",
      startingFrom: "£950",
      output: "One automated workflow",
    },
    problem: {
      title: "Repetitive admin rarely feels urgent.",
      intro:
        "But it quietly eats hours every week through copying, chasing, updating, summarising, reporting, and rewriting the same things.",
      cards: [
        {
          title: "Manual copy-paste",
          text: "Information is moved between inboxes, spreadsheets, CRMs, and documents by hand.",
        },
        {
          title: "Repeated drafting",
          text: "The same types of replies, summaries, updates, and reports are written again and again.",
        },
        {
          title: "Missed reminders",
          text: "Tasks rely on someone remembering to chase, update, or follow up.",
        },
        {
          title: "Scattered information",
          text: "Useful context lives across tools, making simple processes slower than they need to be.",
        },
      ],
    },
    deliverables: {
      title: "One useful workflow, cleaned up and automated.",
      intro:
        "The sprint focuses on one defined process so the scope stays controlled and the outcome is usable.",
      cards: [
        {
          title: "Process review",
          text: "We identify one repetitive workflow worth automating.",
        },
        {
          title: "Workflow map",
          text: "The current process is mapped from trigger to output.",
        },
        {
          title: "Simplified future flow",
          text: "Unnecessary steps are removed before automation is built.",
        },
        {
          title: "Automation build",
          text: "The workflow is built using lightweight tools and AI where useful.",
        },
        {
          title: "Human approval points",
          text: "Sensitive or customer-facing outputs can stay approval-based.",
        },
        {
          title: "Handover Loom",
          text: "You receive a clear walkthrough and operating notes.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Choose one time-hungry process",
        text: "We pick a workflow based on frequency, value, and complexity.",
      },
      {
        step: "02",
        title: "Map the current workflow",
        text: "We document the trigger, tools, steps, decisions, and outputs.",
      },
      {
        step: "03",
        title: "Simplify before automating",
        text: "The process is cleaned up before any automation is built.",
      },
      {
        step: "04",
        title: "Build and test",
        text: "The workflow is built and tested with sample or real scenarios.",
      },
      {
        step: "05",
        title: "Handover",
        text: "You receive a walkthrough, notes, and optional support quote.",
      },
    ],
    beforeAfter: {
      before:
        "A task starts in an inbox, spreadsheet, CRM, or document. Someone manually reads, copies, checks, rewrites, updates, chases, and reports.",
      after:
        "The trigger is captured automatically. Information is extracted, summarised, routed, or drafted. Tasks, records, notifications, or reports are created with human approval where needed.",
      exampleWorkflows: [
        "Enquiry intake and reply drafting",
        "Quote chase automation",
        "Document summary and routing",
        "Weekly report generation",
        "New client onboarding",
        "Review or testimonial request flow",
        "CRM or spreadsheet update automation",
      ],
    },
    scope: {
      title: "Designed to stay focused.",
      intro:
        "This is not a vague AI transformation project. It is a fixed sprint to automate one defined workflow.",
      excluded: [
        "Automating multiple departments at once",
        "Replacing a full CRM, ERP, or finance system",
        "High-risk decisions without human approval",
        "Uncontrolled AI messages to customers",
        "Complex custom software",
        "Ongoing monitoring unless separately agreed",
      ],
    },
    pricing: {
      price: "From £950",
      label: "Fixed automation sprint",
      includes: [
        "One process review",
        "Workflow map",
        "Automation design",
        "One workflow build",
        "Testing",
        "Handover Loom",
      ],
      cta: "Get a free process review",
    },
    faq: [
      {
        question: "Is this about replacing people?",
        answer:
          "No. The goal is to remove repetitive admin so people can spend more time on judgement, service, and sales.",
      },
      {
        question: "Is AI safe to use?",
        answer:
          "Yes, when scoped properly. Sensitive or customer-facing outputs can be drafted by AI and approved by a human before sending.",
      },
      {
        question: "Will we need new tools?",
        answer:
          "Not always. The default is to use your existing tools where possible and add lightweight automation only where needed.",
      },
      {
        question: "Can you automate everything?",
        answer:
          "No. This product focuses on one clearly defined process at a time so the scope stays controlled and useful.",
      },
    ],
    finalCta: {
      title: "Save hours without a huge software project.",
      text: "Show me one repetitive process and I'll map where automation could remove manual work.",
      cta: "Get a free process review",
    },
  },
  "website-revenue-leak-audit": {
    ...productSummaries[2],
    metaTitle: "Website Revenue Leak Audit | Tom Woodhouse",
    metaDescription:
      "A 48-hour audit showing where visitors drop off, hesitate, or fail to convert with a clear priority list of what to fix first.",
    eyebrow: "Productised service",
    title: "Find the website issues costing you enquiries.",
    subtitle:
      "A 48-hour audit showing where visitors drop off, hesitate, or fail to convert - with a clear priority list of what to fix first.",
    primaryCta: "Get a free mini-audit",
    secondaryCta: "See what's included",
    secondaryHref: "#included",
    summary: {
      bestFor: "Sites getting traffic but weak conversion",
      timeline: "48 hours",
      startingFrom: "£350",
      output: "Loom + priority fix list",
    },
    problem: {
      title: "Your website may not be broken.",
      intro:
        "But small points of friction can quietly cost enquiries, bookings, and sales.",
      cards: [
        {
          title: "Visitors hesitate",
          text: "The offer, CTA, or trust signals are not clear enough to make the next step feel obvious.",
        },
        {
          title: "Mobile feels awkward",
          text: "The page may technically work, but the mobile journey feels slow, cramped, or unclear.",
        },
        {
          title: "Forms create friction",
          text: "People are asked too much, too soon, or the next step feels uncertain.",
        },
        {
          title: "Tracking is incomplete",
          text: "You cannot clearly see which pages or channels are producing real enquiries.",
        },
      ],
    },
    deliverables: {
      title: "A clear diagnosis of what to fix first.",
      intro:
        "The audit gives you a practical, prioritised view of the issues most likely to affect conversion.",
      cards: [
        {
          title: "Loom walkthrough",
          text: "A 20-30 minute walkthrough of the main conversion journey.",
        },
        {
          title: "Mobile journey review",
          text: "A mobile-first review of the path from landing to enquiry or purchase.",
        },
        {
          title: "CTA and form review",
          text: "A practical check of the calls to action, forms, booking flow, or checkout.",
        },
        {
          title: "Speed and tracking check",
          text: "A basic sanity check of performance and conversion tracking.",
        },
        {
          title: "Top 10 priority fixes",
          text: "The main issues ranked by likely impact.",
        },
        {
          title: "Optional fix quote",
          text: "A fixed-price implementation quote if you want the issues handled.",
        },
      ],
    },
    process: [
      {
        step: "01",
        title: "Send the website and context",
        text: "You share the URL and what the site is meant to achieve.",
      },
      {
        step: "02",
        title: "Review the main conversion journey",
        text: "I go through the path a visitor takes to enquire, book, or buy.",
      },
      {
        step: "03",
        title: "Record the walkthrough",
        text: "I explain the issues clearly with screen recording.",
      },
      {
        step: "04",
        title: "Rank the top issues",
        text: "You get a prioritised list of what to fix first.",
      },
      {
        step: "05",
        title: "Receive the audit",
        text: "You receive the Loom, notes, and optional implementation quote.",
      },
    ],
    beforeAfter: {
      before:
        "Visitors land on the site, but the path to enquire or purchase is unclear, slow, or hard to trust.",
      after:
        "You have a clear priority list showing what to fix first and why it matters commercially.",
    },
    scope: {
      title: "Designed to stay focused.",
      intro:
        "This is not a full redesign, SEO audit, or endless CRO programme. It is a focused diagnostic to identify the highest-impact fixes first.",
      excluded: [
        "Full redesign",
        "Full SEO audit",
        "Paid ads strategy",
        "Implementation of fixes",
        "Complex CRO experimentation",
        "Analytics rebuild unless separately scoped",
      ],
    },
    pricing: {
      price: "From £350",
      label: "Fixed 48-hour audit",
      includes: [
        "Loom walkthrough",
        "Mobile journey review",
        "CTA/form review",
        "Speed/tracking check",
        "Top 10 priority fixes",
        "Optional fix quote",
      ],
      cta: "Get a free mini-audit",
    },
    faq: [
      {
        question: "Are you just going to tell me I need a new website?",
        answer:
          "No. The audit prioritises practical fixes first. A rebuild is only recommended if smaller fixes cannot solve the core issue.",
      },
      {
        question: "Can you guarantee more sales?",
        answer:
          "No. The audit identifies likely friction and improvement opportunities. Results depend on traffic quality, offer strength, pricing, and implementation.",
      },
      {
        question: "Do you need access to analytics?",
        answer: "Helpful but not required for the starter audit.",
      },
      {
        question: "Can you implement the fixes?",
        answer:
          "Yes. Implementation is quoted separately after the audit, usually as a fixed sprint.",
      },
    ],
    finalCta: {
      title: "Find the leaks before spending more on traffic.",
      text: "Get a quick review of where your website may be losing enquiries and what to fix first.",
      cta: "Get a free mini-audit",
    },
  },
};

export const productOptions = productSummaries.map((product) => ({
  value: product.slug,
  label: product.name,
}));
