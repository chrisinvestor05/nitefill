export const NAV_LINKS = [
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Testimonials", href: "/#testimonials" },
  { name: "Pricing", href: "/#pricing" },
  { name: "FAQ", href: "/#faq" },
  { name: "Contact", href: "/contact" },
] as const;

export const PROBLEM_POINTS = [
  "Most DJs don't have an audience of their own. Every gig starts from zero, borrowing the promoter's crowd.",
  "The time that should go into content, brand and community disappears into chasing the next booking.",
  "Venues fill Friday, then start again on Monday. No memory of who came, no reason for them to return.",
  "Everyone rents their audience through ads and algorithms instead of owning one.",
  "Nights that don't compound. Every week starts from scratch, and nothing you built last month makes this month easier.",
] as const;

export const HOW_IT_WORKS = [
  {
    number: "01",
    title: "We find the people near you who would actually come",
    description:
      "Tell us the city and the kind of night. We surface the people nearby most likely to come to it.",
    proof: "People near you, not a bought list",
  },
  {
    number: "02",
    title: "Each invite is written for one person",
    description:
      "You write one message. We rewrite it around their profile and send them one at a time.",
    proof: "hey Maya, saw you’re local…",
  },
  {
    number: "03",
    title: "You build a career, not just a set",
    description:
      "A private room of DJs, with the playbooks behind the business of getting booked.",
    proof: "136 lessons, 18 modules",
  },
] as const;

export const DEMO_STEPS = [
  {
    id: "targeting",
    title: "We find your crowd",
    description:
      "Tell us the city and the kind of night. We surface the people nearby most likely to come to it.",
    example: "2,847 people near you",
  },
  {
    id: "messaging",
    title: "Every invite written for one person",
    description:
      "You write one message. We rewrite it around each profile and send them one at a time.",
    example: "No two sends identical",
  },
] as const;

export const PROFESSIONALS = [
  {
    tagline: "Grow fanbase",
    title: "DJs",
    bullets: [
      "Unlock more venue bookings",
      "Fill gigs consistently",
      "Command better fees",
    ],
    image: "/images/dj.jpg",
  },
  {
    tagline: "Sell out shows",
    title: "Promoters",
    bullets: [
      "Target the right crowd fast",
      "Automate warm, human-style DMs",
      "Track conversations and conversions to win more clients",
    ],
    image: "/images/promoter.jpg",
  },
  {
    tagline: "Build community",
    title: "Venues",
    bullets: [
      "Turn followers into repeat attendees",
      "Promote nights on autopilot",
      "Create organic exposure that brings the right people in",
    ],
    image: "/images/venue.jpg",
  },
] as const;

export const TESTIMONIALS = [
  {
    name: "Dulci",
    role: "Event Brand",
    location: "London",
    quote: "Our events finally fill consistently.",
    image: "/images/dulci.png",
    accent: "teal" as const,
  },
  {
    name: "Mandarin Oriental Knightsbridge",
    role: "Luxury Hotel & Events",
    location: "London",
    quote: "The crowd quality improved instantly.",
    image: "/images/mandarin.jpeg",
    accent: "orange" as const,
  },
  {
    name: "Moun",
    role: "House DJ",
    location: "International",
    quote: "The right people started showing up.",
    image: "/images/peezy.jpg",
    accent: "teal" as const,
  },
  {
    name: "Peezy",
    role: "DJ",
    location: "London",
    quote: "My sets turned into a real community.",
    image: "/images/moun.jpg",
    accent: "orange" as const,
  },
  {
    name: "Nigel Calland",
    role: "DJ",
    location: "Tulum",
    quote: "Nitefill helped me connect with likeminded people and actually find them.",
    image: "/images/nigel.jpg",
    accent: "teal" as const,
  },
];

export const FAQS = [
  {
    question: "What is Nitefill?",
    answer:
      "Nitefill finds your crowd on Instagram and sends each one a personal invite. You set the event, the city, and the tone. We find the people most likely to come, rewrite your message for each of them, and send them one at a time — so the only part left for you is replying.",
  },
  {
    question: "What is The Nitefill Room?",
    answer:
      "The Room is the course and the community. 136 lessons across 18 modules on the business of being a DJ — building an identity, getting proof promoters trust, negotiating a fee, understanding what a booking is actually worth, and how the industry is put together. It is about the career, not the mixing.",
  },
  {
    question: "What's the difference between Room and Pro?",
    answer:
      "The Room ($35/month) is the course and the community. Nitefill Pro ($49/month) is the software — automated Instagram outreach, up to 2,000 invites a month, and the campaign tracking behind it. The Room teaches you how to fill a room. Pro does the sending.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Every plan starts with a 7-day free trial that begins the moment you pick one. On Pro you can run real campaigns during it, not a demo. Cancel before day seven and you are not charged.",
  },
  {
    question: "Do I have to find people myself?",
    answer:
      "No. You tell us the city and the kind of night, and we surface the people nearby most likely to come to it. You can narrow that with filters if you want to. There is no list to build and nothing to upload.",
  },
  {
    question: "Do Instagram DMs actually work to fill events?",
    answer:
      "A message written for one person gets read in a way a post does not. It arrives in an inbox instead of a feed, it mentions something real about them, and it asks a specific question. Most nights do not fail on the music — they fail because nobody was actually invited.",
  },
  {
    question: "Is Nitefill safe for my Instagram account?",
    answer:
      "You set the daily limit, and SafeSend spreads those messages across the day with uneven gaps rather than sending them in a block. It watches how your account responds as the campaign runs and eases off on its own. New campaigns start at 35 a day, which is deliberately low.",
  },
  {
    question: "How many messages can I send a day?",
    answer:
      "You choose, anywhere from 10 to 100 a day, and you can change it mid-campaign. The default is 35. Pro covers up to 2,000 invites a month across all your campaigns.",
  },
  {
    question: "Can I write the message myself?",
    answer:
      "Yes. You write it, set the length and the ask, and see it before anything goes out. Each copy is then rewritten for the person receiving it using their profile and posts, so no two sends are identical.",
  },
  {
    question: "What happens when someone replies?",
    answer:
      "It goes straight to your Instagram inbox. Nitefill does not intercept replies or answer on your behalf. You will see which campaign and which opening line started the conversation, so you learn what actually works.",
  },
  {
    question: "Do I need to give Nitefill my Instagram password?",
    answer:
      "No, and we never ask for one. You connect through a secure session from your own browser, your password never touches our servers, and you can disconnect from your dashboard at any time.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. No contract and no notice period — cancel from your subscription settings whenever you like.",
  },
];

export const ROOM_PILLARS = [
  "A DJ identity that gets you booked",
  "Proof promoters trust",
  "Content that converts into gigs",
  "Outreach that gets replies",
  "Relationships with promoters & venues",
  "Repeat bookings & momentum",
  "Positioning for residencies & agencies",
  "Opportunities for festivals & bigger stages",
] as const;

export type PlanId = "starter" | "pro" | "agency";
export type BillingCycle = "monthly" | "yearly";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  yearlyPrice: number;
  dmLimit: number;
  features: string[];
  popular: boolean;
  cta: string;
  accent: "teal" | "orange" | "warning";
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "The Nitefill Room",
    description:
      "Build the identity, proof, content, and relationships that get you booked.",
    price: 3500,
    yearlyPrice: 27840,
    dmLimit: 0,
    features: [...ROOM_PILLARS],
    popular: false,
    cta: "Join The Room",
    accent: "teal",
  },
  {
    id: "pro",
    name: "Nitefill Pro",
    description:
      "Automated Instagram outreach that fills the floor — plus everything in The Room.",
    price: 4900,
    yearlyPrice: 47040,
    dmLimit: 2000,
    features: [
      "2,000 automated DMs/month",
      "Bio-aware personalised messaging",
      "Advanced campaign analytics",
      "Priority support",
      "Custom message templates",
      "Human-paced sending for account safety",
    ],
    popular: true,
    cta: "Start free trial",
    accent: "orange",
  },
  {
    id: "agency",
    name: "Agency",
    description: "For agencies managing multiple artists and high-volume outreach.",
    price: 19900,
    yearlyPrice: 191040,
    dmLimit: 10000,
    features: [
      "Custom outreach volume",
      "Dedicated support",
      "Advanced reporting options",
      "Multi-artist management",
      "Custom integrations available",
    ],
    popular: false,
    cta: "Subscribe",
    accent: "warning",
  },
];

export function planById(id: string): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[1]!;
}

export function priceFor(plan: Plan, cycle: BillingCycle): number {
  return cycle === "yearly" ? plan.yearlyPrice : plan.price;
}

export function monthlyEquivalent(plan: Plan, cycle: BillingCycle): number {
  return cycle === "yearly" ? Math.round(plan.yearlyPrice / 12) : plan.price;
}

export type CatalogProfile = {
  handle: string;
  displayName: string;
  city: string;
  gender: "male" | "female";
  bio: string;
  recentPost: string;
  genreTags: string[];
};

export const AUDIENCE_CATALOG: CatalogProfile[] = [
  { handle: "maya.moves", displayName: "Maya Chen", city: "London", gender: "female", bio: "House / disco. Ministry regular. Rooftops over clubs.", recentPost: "Still thinking about that Fabric terrace set.", genreTags: ["house", "disco"] },
  { handle: "tomfabric", displayName: "Tom Ellis", city: "London", gender: "male", bio: "Techno nights. Camera in one hand, pint in the other.", recentPost: "That Fabric clip from Saturday was unreal.", genreTags: ["techno", "house"] },
  { handle: "nia.nights", displayName: "Nia Okonkwo", city: "London", gender: "female", bio: "Afro house, amapiano, never home before 4.", recentPost: "Looking for a rooftop this month that isn't packed with tourists.", genreTags: ["afro house", "amapiano"] },
  { handle: "lewis.on.the.ones", displayName: "Lewis Grant", city: "Manchester", gender: "male", bio: "Warehouse techno. Warehouse anything, really.", recentPost: "Train to London Friday if the lineup holds.", genreTags: ["techno"] },
  { handle: "sof.vinyl", displayName: "Sofia Alvarez", city: "London", gender: "female", bio: "Balearic, leftfield house, record shop Sundays.", recentPost: "Need a smaller room. Same energy, fewer phones.", genreTags: ["house", "balearic"] },
  { handle: "kai.bass", displayName: "Kai Mensah", city: "London", gender: "male", bio: "UKG and broken beat. Peckham / New Cross circuit.", recentPost: "If you know, you know. Not posting the location.", genreTags: ["ukg", "house"] },
  { handle: "elena.afterhours", displayName: "Elena Rossi", city: "Berlin", gender: "female", bio: "Berghain tourist turned local. Dark rooms, long nights.", recentPost: "In London next weekend — who's playing?", genreTags: ["techno"] },
  { handle: "jules.decks", displayName: "Jules Hart", city: "London", gender: "male", bio: "Promoter at a 300-cap east London room.", recentPost: "Always looking for people who actually dance.", genreTags: ["house", "techno"] },
  { handle: "priya.groove", displayName: "Priya Shah", city: "London", gender: "female", bio: "Bollywood-to-house blends. Dalston residencies.", recentPost: "Friday was half empty and it still slapped. Imagine a full one.", genreTags: ["house"] },
  { handle: "omar.lowend", displayName: "Omar Haddad", city: "London", gender: "male", bio: "Dub, bass, rare groove. Not a tourist.", recentPost: "Ministry last month. Looking for the next proper one.", genreTags: ["bass", "house"] },
  { handle: "rhi.nights", displayName: "Rhiannon Cole", city: "Bristol", gender: "female", bio: "Bassline, jungle, anything that moves a room.", recentPost: "Coming up to London for a rooftop if it's the right one.", genreTags: ["bass", "jungle"] },
  { handle: "andres.keys", displayName: "Andres Silva", city: "Lisbon", gender: "male", bio: "Melodic house. Sunrise sets. Visiting London often.", recentPost: "Anyone got a rooftop with an actual soundsystem?", genreTags: ["melodic house", "house"] },
  { handle: "lina.floor", displayName: "Lina Petrov", city: "London", gender: "female", bio: "Peak-time techno. No bottle service.", recentPost: "The right people started showing up when the DMs got personal.", genreTags: ["techno"] },
  { handle: "marcus.loop", displayName: "Marcus Adeyemi", city: "London", gender: "male", bio: "Afrobeats into 2-step. Promoter-adjacent.", recentPost: "Filling a Tuesday is the real flex.", genreTags: ["afrobeats", "ukg"] },
  { handle: "hana.sunset", displayName: "Hana Kim", city: "London", gender: "female", bio: "Organic house, cafe-to-club. Shoreditch.", recentPost: "I show up when someone actually invites me.", genreTags: ["organic house", "house"] },
  { handle: "dex.strobe", displayName: "Dex Walker", city: "London", gender: "male", bio: "Industrial techno. Photography on the side.", recentPost: "Need a room that still has air left in it.", genreTags: ["techno"] },
  { handle: "amira.pulse", displayName: "Amira Benali", city: "Paris", gender: "female", bio: "In London two weekends a month. Disco edits.", recentPost: "Who's doing rooftops that aren't just a bar with a DJ?", genreTags: ["disco", "house"] },
  { handle: "noah.riddim", displayName: "Noah Patel", city: "London", gender: "male", bio: "D&B heads, Fabric Room 2 lifer.", recentPost: "Saturday was a wash. Need a better invite next time.", genreTags: ["dnb"] },
  { handle: "ivy.warm", displayName: "Ivy Moreau", city: "London", gender: "female", bio: "Deep house, quiet confidence, good shoes.", recentPost: "Saw you were at Ministry a couple of weeks back.", genreTags: ["deep house", "house"] },
  { handle: "seb.warehouse", displayName: "Seb Novak", city: "London", gender: "male", bio: "Illegal-feeling legal rooms. That's the brief.", recentPost: "Smaller room, same energy. That's the night.", genreTags: ["techno", "house"] },
  { handle: "zara.late", displayName: "Zara Quinn", city: "Manchester", gender: "female", bio: "The Warehouse Project regular. Trains south for the right bill.", recentPost: "London Friday. Don't make me queue for a mediocre night.", genreTags: ["techno", "house"] },
  { handle: "benji.edit", displayName: "Benji Cole", city: "London", gender: "male", bio: "Edits, reworks, not original enough to say producer yet.", recentPost: "If the message doesn't mention me, I don't open it.", genreTags: ["house", "disco"] },
  { handle: "leila.glow", displayName: "Leila Farouk", city: "London", gender: "female", bio: "Middle-eastern percussion into club. Hybrid nights.", recentPost: "Looking for people who listen, not just film.", genreTags: ["world", "house"] },
  { handle: "chris.stems", displayName: "Chris Lang", city: "London", gender: "male", bio: "Open to gigs. Also open to being invited as a punter.", recentPost: "Promoters who DM like humans get a yes.", genreTags: ["house"] },
  { handle: "nina.velvet", displayName: "Nina Volkova", city: "London", gender: "female", bio: "Italo, cosmic, anything with a story.", recentPost: "Rooftop on the 14th? Depends who else is in the room.", genreTags: ["disco", "italo"] },
  { handle: "jay.circle", displayName: "Jay Okeke", city: "London", gender: "male", bio: "Amapiano community nights. South London.", recentPost: "The crowd quality is the whole product.", genreTags: ["amapiano"] },
  { handle: "freya.tide", displayName: "Freya Nilsen", city: "London", gender: "female", bio: "Nordic techno, visiting from Oslo half the year.", recentPost: "Tell me why this night, not just that it exists.", genreTags: ["techno"] },
  { handle: "otto.groove", displayName: "Otto Berg", city: "Amsterdam", gender: "male", bio: "In London for work. Clubs after.", recentPost: "A personal invite beats a story sticker every time.", genreTags: ["house", "techno"] },
  { handle: "sasha.room", displayName: "Sasha Reed", city: "London", gender: "female", bio: "Runs a small mailing list for leftfield nights.", recentPost: "I go where my people are. Help me find them.", genreTags: ["leftfield", "house"] },
  { handle: "malik.drive", displayName: "Malik Johnson", city: "London", gender: "male", bio: "UK funky revival. Car stereo first, club second.", recentPost: "Fill the floor before you film it.", genreTags: ["uk funky", "ukg"] },
  { handle: "cleo.nights", displayName: "Cleo Martin", city: "New York", gender: "female", bio: "In London this month. House historian.", recentPost: "Don't send me a link. Send me a reason.", genreTags: ["house"] },
  { handle: "hugo.press", displayName: "Hugo Laurent", city: "London", gender: "male", bio: "Music journalist who still goes out. Rare.", recentPost: "The nights that feel invited, not advertised.", genreTags: ["house", "disco"] },
  { handle: "aya.lowlight", displayName: "Aya Tanaka", city: "London", gender: "female", bio: "Minimal, afters, no small talk on the floor.", recentPost: "Saw a clip from a rooftop. Need the actual address via DM.", genreTags: ["minimal", "techno"] },
  { handle: "finn.circle", displayName: "Finn Gallagher", city: "Dublin", gender: "male", bio: "Fly in for the right London bill.", recentPost: "Personal messages convert. Posts don't.", genreTags: ["house"] },
  { handle: "rosa.salt", displayName: "Rosa Mendes", city: "London", gender: "female", bio: "Latin house, samba-into-club. Brixton / Elephant.", recentPost: "Invite the dancers and the rest follows.", genreTags: ["latin house", "house"] },
  { handle: "theo.grid", displayName: "Theo Brooks", city: "London", gender: "male", bio: "Lighting tech by day, raver by night.", recentPost: "I can tell when a room was filled by ads.", genreTags: ["techno"] },
  { handle: "mira.echo", displayName: "Mira Das", city: "London", gender: "female", bio: "Experimental club. Not for everyone, on purpose.", recentPost: "The right 80 people beat the wrong 400.", genreTags: ["experimental", "leftfield"] },
  { handle: "owen.shift", displayName: "Owen Clarke", city: "Leeds", gender: "male", bio: "Northern bass. In London when the lineup's honest.", recentPost: "Stop blasting. Start inviting.", genreTags: ["bass"] },
  { handle: "kira.bloom", displayName: "Kira Jensen", city: "London", gender: "female", bio: "Melodic techno, flowers in the bio, serious on the floor.", recentPost: "If you saw my stories from Ministry, you already know.", genreTags: ["melodic techno", "techno"] },
  { handle: "dante.room2", displayName: "Dante Cole", city: "London", gender: "male", bio: "Room 2 forever. Don't @ me about Room 1.", recentPost: "A rooftop house night on the 14th could work.", genreTags: ["house", "techno"] },
];

export type Lesson = { id: string; title: string; minutes: number; summary: string };
export type CourseModule = {
  id: string;
  number: number;
  title: string;
  blurb: string;
  lessons: Lesson[];
};

function L(moduleId: string, n: number, title: string, minutes: number, summary: string): Lesson {
  return { id: `${moduleId}-${n}`, title, minutes, summary };
}

export const COURSE_MODULES: CourseModule[] = [
  {
    id: "identity",
    number: 1,
    title: "DJ Identity",
    blurb: "A name, a lane, and a reason promoters remember you.",
    lessons: [
      L("identity", 1, "What promoters actually hear when you say your name", 8, "The first seven seconds of a pitch are identity, not discography."),
      L("identity", 2, "Picking a lane without boxing yourself in", 10, "Genre as a promise, not a prison."),
      L("identity", 3, "The one-line bio that books rooms", 7, "City, sound, proof — in that order."),
      L("identity", 4, "Visual consistency without a 4k brand kit", 9, "Fonts, crop, colour. Three decisions, then stop."),
      L("identity", 5, "Positioning against the local scene", 12, "You are not competing with Boiler Room. You are competing with Thursday."),
      L("identity", 6, "The anti-cringe test", 6, "If you wouldn't say it to a booker in person, don't put it in a bio."),
      L("identity", 7, "Identity drift: when to evolve", 8, "How residencies and new cities should change the page, not the person."),
    ],
  },
  {
    id: "proof",
    number: 2,
    title: "Proof Promoters Trust",
    blurb: "Social proof that survives a sceptical booker.",
    lessons: [
      L("proof", 1, "What counts as proof (and what doesn't)", 9, "A story view is not a crowd."),
      L("proof", 2, "Filming a room so it looks full and honest", 11, "Angles, timing, and why the first 30 seconds of a recap lie."),
      L("proof", 3, "Quotes, recaps, and the screenshot stack", 8, "How to ask for a quote without sounding thirsty."),
      L("proof", 4, "Numbers you can stand behind", 10, "Capacity, percentage full, return rate — pick two."),
      L("proof", 5, "Borrowing credibility without stealing it", 7, "Support slots, back-to-backs, and name-drops that don't backfire."),
      L("proof", 6, "The EPK that actually gets opened", 12, "One page. Four assets. No SoundCloud dump."),
      L("proof", 7, "When you have nothing yet", 9, "Manufacturing the first proof loop from house parties and friends' nights."),
    ],
  },
  {
    id: "content",
    number: 3,
    title: "Content That Converts",
    blurb: "Posts that move people from the feed to the floor.",
    lessons: [
      L("content", 1, "Awareness is not attendance", 7, "Why reach without invites is a quiet room."),
      L("content", 2, "The weekly content stack", 11, "One recap, one teaser, one human, one invite."),
      L("content", 3, "Hooks that sound like you", 8, "Writing openings that aren't 'BIG ONE THIS FRIDAY'."),
      L("content", 4, "When to post a lineup (and when not to)", 6, "Lineups as social proof vs lineups as noise."),
      L("content", 5, "Stories as a conversation, not a broadcast", 9, "Polls, questions, close-friends lists."),
      L("content", 6, "Repurposing a 12-second clip", 8, "One night, eight assets, zero extra filming."),
      L("content", 7, "Killing content that doesn't convert", 7, "A simple two-week kill list."),
    ],
  },
  {
    id: "instagram",
    number: 4,
    title: "Instagram as Infrastructure",
    blurb: "Treat the account like a venue, not a moodboard.",
    lessons: [
      L("instagram", 1, "Profile architecture", 8, "Grid, highlights, link — the three-second audit."),
      L("instagram", 2, "Who to follow, who to mute", 7, "Signal vs the scene's groupchat energy."),
      L("instagram", 3, "Close Friends as a VIP list", 9, "The unsexy growth channel that actually compounds."),
      L("instagram", 4, "DMs as a product, not a chore", 10, "Inbox hygiene for people who play four nights a week."),
      L("instagram", 5, "When the algorithm is working against a night", 8, "What to do in the 10 days before a show."),
      L("instagram", 6, "Collabs without looking desperate", 7, "How to ask, how to split the credit."),
      L("instagram", 7, "Safety, blocks, and energy vampires", 6, "Protecting the account you built."),
    ],
  },
  {
    id: "dm-pitching",
    number: 5,
    title: "DM Pitching 101",
    blurb: "The invite that gets a reply, not a request.",
    lessons: [
      L("dm-pitching", 1, "Why a message without a link converts", 8, "Links trip spam filters and kill curiosity."),
      L("dm-pitching", 2, "The four-line invite", 10, "Notice, night, why them, question."),
      L("dm-pitching", 3, "Variables that make it theirs", 9, "Name, last post, last venue, city."),
      L("dm-pitching", 4, "Tone: warm, not salesy", 7, "Reading your message out loud as a test."),
      L("dm-pitching", 5, "Who not to message", 8, "Minors, private accounts, people who opted out, the obviously wrong crowd."),
      L("dm-pitching", 6, "Follow-ups that don't haunt people", 9, "One bump, then stop."),
      L("dm-pitching", 7, "Turning a reply into a yes", 11, "Details, guest list, the walk-in problem."),
      L("dm-pitching", 8, "Logging what worked", 6, "Hooks, cities, nights — a simple scoreboard."),
    ],
  },
  {
    id: "outreach",
    number: 6,
    title: "Outreach Cadence",
    blurb: "A system, not a Sunday-night panic.",
    lessons: [
      L("outreach", 1, "The 21-day runway", 10, "When to start inviting for a Friday."),
      L("outreach", 2, "Daily limits that keep accounts alive", 8, "Why 35 is the default."),
      L("outreach", 3, "Seed accounts vs cold lists", 9, "Borrowing a crowd without scraping a crowd."),
      L("outreach", 4, "City, genre, gender — filters that matter", 7, "Precision without being creepy."),
      L("outreach", 5, "Pacing across a week", 8, "Front-load curiosity, back-load confirmation."),
      L("outreach", 6, "Running two nights at once", 9, "How to not mix the invites."),
      L("outreach", 7, "When to pause", 6, "Health signals, weird reply rates, Instagram mood swings."),
    ],
  },
  {
    id: "negotiation",
    number: 7,
    title: "Club Booker Negotiation",
    blurb: "Fees, doors, and the sentence that gets you paid.",
    lessons: [
      L("negotiation", 1, "What a booking is actually worth", 12, "Door vs fee vs bar vs 'exposure'."),
      L("negotiation", 2, "The first email / DM to a booker", 10, "Short, dated, with proof attached."),
      L("negotiation", 3, "Hold, confirm, advance", 8, "The three states of a gig and why DJs lose money in the middle one."),
      L("negotiation", 4, "Talking about money without flinching", 11, "Scripts for the fee question."),
      L("negotiation", 5, "When to walk", 7, "Red lines: unpaid, unsafe, unclear."),
      L("negotiation", 6, "Support slots as a ladder, not a trap", 9, "How to use them, how to leave them."),
      L("negotiation", 7, "Contracts that fit on one page", 10, "Time, fee, cancel, recap rights."),
    ],
  },
  {
    id: "pricing",
    number: 8,
    title: "Pricing Your Set",
    blurb: "A number you can say out loud.",
    lessons: [
      L("pricing", 1, "Costing a night like a small business", 10, "Travel, time, recovery, opportunity."),
      L("pricing", 2, "Weekday vs weekend rates", 7, "The calendar is the product."),
      L("pricing", 3, "Raising the fee without losing the room", 9, "Anchors, packages, 'from' pricing."),
      L("pricing", 4, "Residencies and retainers", 8, "Predictable money vs peak money."),
      L("pricing", 5, "When the door is the deal", 9, "How to not get destroyed by a wet Wednesday."),
      L("pricing", 6, "Invoicing, deposits, no-shows", 8, "The unsexy 20% of the job."),
      L("pricing", 7, "Saying no to the wrong well-paid gig", 7, "Brand damage is a real cost."),
    ],
  },
  {
    id: "fanbase",
    number: 9,
    title: "Fanbase Flywheel",
    blurb: "People who come because of you, not the promoter.",
    lessons: [
      L("fanbase", 1, "Owned vs rented audience", 8, "Why Instagram is rented and what to own instead."),
      L("fanbase", 2, "Capturing names at the door", 9, "QR, guest list, the after-text."),
      L("fanbase", 3, "The second night problem", 10, "How to get them back without a new lineup."),
      L("fanbase", 4, "City clusters", 8, "20 people in one postcode beat 200 scattered."),
      L("fanbase", 5, "Turning ravers into scouts", 7, "Referral language that doesn't feel MLM."),
      L("fanbase", 6, "Email / broadcast without becoming a brand account", 9, "A monthly note beats daily noise."),
      L("fanbase", 7, "Measuring the flywheel", 11, "Return rate, invite-to-door, time-to-full."),
      L("fanbase", 8, "When the flywheel stalls", 8, "Diagnosing empty Tuesdays."),
    ],
  },
  {
    id: "scene",
    number: 10,
    title: "Reading a City",
    blurb: "Every scene has a grammar. Learn it before you play it.",
    lessons: [
      L("scene", 1, "Mapping a city's rooms", 10, "Caps, door policies, who actually books."),
      L("scene", 2, "Nights vs venues", 8, "You are booking a night, not a postcode."),
      L("scene", 3, "Promoters, residents, ghost bookers", 9, "The three people who can say yes."),
      L("scene", 4, "Tourist cities vs local cities", 7, "London is not Berlin is not Ibiza."),
      L("scene", 5, "Being new in town", 11, "The 90-day plan for a fresh city."),
      L("scene", 6, "Respecting rooms that aren't yours yet", 6, "How DJs get quietly blacklisted."),
      L("scene", 7, "Building a night, not just playing one", 10, "When to stop waiting to be chosen."),
    ],
  },
  {
    id: "relationships",
    number: 11,
    title: "Promoters & Venues",
    blurb: "The long game that turns one gig into a run.",
    lessons: [
      L("relationships", 1, "How to be easy to book", 8, "On time, on brief, on the recap."),
      L("relationships", 2, "After the gig: the 24-hour window", 7, "Thank-yous that aren't cringe."),
      L("relationships", 3, "Bringing a crowd once", 9, "Then bringing a crowd twice."),
      L("relationships", 4, "Sharing the upside", 8, "When to bring your own night into their room."),
      L("relationships", 5, "Conflict, double-books, and ghosting", 10, "Adult communication in an industry that avoids it."),
      L("relationships", 6, "Becoming the person they call at 6pm", 7, "Reliability as a career strategy."),
      L("relationships", 7, "Leaving a room well", 6, "Don't burn the bridge on the way to a bigger one."),
    ],
  },
  {
    id: "residencies",
    number: 12,
    title: "Residencies",
    blurb: "The difference between a booking and a home.",
    lessons: [
      L("residencies", 1, "What a residency actually is", 8, "Regularity, identity, ownership of the crowd."),
      L("residencies", 2, "Pitching one", 11, "The one-pager: night, crowd, cadence, split."),
      L("residencies", 3, "Programming a room for three months", 10, "Guests, themes, when to repeat yourself."),
      L("residencies", 4, "Protecting the night from the venue", 9, "Door policy, capacity, sound, photography."),
      L("residencies", 5, "When the residency is quietly dying", 8, "Early warning signs."),
      L("residencies", 6, "Stacking residencies without becoming a resident DJ cliché", 7, "Two rooms, two promises."),
      L("residencies", 7, "Ending or evolving", 8, "Rebrands, spin-offs, handovers."),
    ],
  },
  {
    id: "agencies",
    number: 13,
    title: "The Agency Path",
    blurb: "When to get represented, and what you give up.",
    lessons: [
      L("agencies", 1, "What an agency actually does", 9, "Routing, relationships, and the 15–20%."),
      L("agencies", 2, "When you are too early", 8, "Agencies don't build your first crowd. You do."),
      L("agencies", 3, "Approaching one without begging", 10, "Proof pack, cities, calendar."),
      L("agencies", 4, "Reading a deal", 12, "Territory, term, exclusivity, sunset."),
      L("agencies", 5, "Working with them week to week", 7, "What good talent does between emails."),
      L("agencies", 6, "Going independent on purpose", 8, "The operator-DJ model."),
      L("agencies", 7, "Leaving well", 7, "Notice, overlapping holds, remaining friends with the booker."),
    ],
  },
  {
    id: "festivals",
    number: 14,
    title: "Festival Playbook",
    blurb: "Bigger stages, different physics.",
    lessons: [
      L("festivals", 1, "How festival bookings actually happen", 10, "Agents, stages, last year's spreadsheet."),
      L("festivals", 2, "The tape and the one-sheet", 8, "What a booker plays in a car."),
      L("festivals", 3, "Day parties vs night slots", 7, "Energy, alcohol, families, rain."),
      L("festivals", 4, "Getting paid on time (good luck)", 9, "Deposits, production riders, invoices with teeth."),
      L("festivals", 5, "Using a festival to fill the next club date", 8, "Capture, recap, invite."),
      L("festivals", 6, "When a festival is the wrong move", 6, "Brand, fee, travel, clash."),
      L("festivals", 7, "Building a season, not a one-off", 10, "Spring announcements, summer run, autumn clubs."),
    ],
  },
  {
    id: "ai-lab",
    number: 15,
    title: "AI Creative Lab",
    blurb: "Use the machine for the grunt work. Keep the taste.",
    lessons: [
      L("ai-lab", 1, "What AI is good for in nightlife", 8, "Rewrites, variants, research. Not your personality."),
      L("ai-lab", 2, "Writing a source message worth rewriting", 9, "Garbage in, 2,000 pieces of garbage out."),
      L("ai-lab", 3, "Profile-aware invites without sounding like a stalker", 10, "Public posts only, light touch, no private trivia."),
      L("ai-lab", 4, "Voice lock: making it still sound like you", 8, "Banned phrases, length, the question at the end."),
      L("ai-lab", 5, "Review before send. Always.", 6, "The human gate that keeps accounts alive."),
      L("ai-lab", 6, "Using AI for recaps and follow-ups", 7, "After the night, not during."),
      L("ai-lab", 7, "Ethics, consent, and the line", 9, "No minors, no scraped privates, no impersonation."),
    ],
  },
  {
    id: "analytics",
    number: 16,
    title: "Analytics & Iteration",
    blurb: "Know which sentence filled the room.",
    lessons: [
      L("analytics", 1, "The only five numbers", 8, "Sent, delivered, replied, yes, through the door."),
      L("analytics", 2, "Hook tests that don't wreck pacing", 9, "Two openings, one night."),
      L("analytics", 3, "City and genre heatmaps", 7, "Where your people actually live."),
      L("analytics", 4, "Reply quality vs reply rate", 8, "A 'who is this' is not a win."),
      L("analytics", 5, "Connecting outreach to the door", 10, "Guest lists, codes, the honesty problem."),
      L("analytics", 6, "Weekly review ritual", 6, "Fifteen minutes, every Monday."),
      L("analytics", 7, "Killing a dead campaign", 7, "Sunk cost in DMs."),
    ],
  },
  {
    id: "ops",
    number: 17,
    title: "Ops for a One-Person Label",
    blurb: "Calendar, money, energy.",
    lessons: [
      L("ops", 1, "A calendar that protects recovery", 8, "You cannot play 18 nights and also have a career."),
      L("ops", 2, "Travel maths", 7, "When the train costs more than the fee."),
      L("ops", 3, "Collaborators: lighting, photo, door", 9, "Building a tiny crew."),
      L("ops", 4, "Taxes, invoices, putting money aside", 10, "The unglamorous bit that keeps you in the game."),
      L("ops", 5, "Burnout looks like bad music", 7, "Spot it before the room does."),
      L("ops", 6, "Systems over memory", 8, "Checklists for advance, set, recap."),
      L("ops", 7, "Saying no as an operating system", 6, "Default-no, exception-yes."),
    ],
  },
  {
    id: "career",
    number: 18,
    title: "Career Architecture",
    blurb: "A decade, not a season.",
    lessons: [
      L("career", 1, "The three careers hiding in 'DJ'", 10, "Artist, operator, personality. Pick a mix."),
      L("career", 2, "Five-year maps that survive a bad quarter", 9, "Cities, rooms, income floors."),
      L("career", 3, "When to go full-time", 11, "The number, the runway, the lie of 'one more year'."),
      L("career", 4, "Reputation as compounding interest", 8, "Every room is a reference."),
      L("career", 5, "Building something that isn't your name", 10, "Nights, labels, crews."),
      L("career", 6, "Coming back from a quiet year", 8, "The re-entry campaign."),
      L("career", 7, "What staying booked actually means", 7, "It's a system. You already have the pieces."),
    ],
  },
];

export const ALL_LESSONS: Lesson[] = COURSE_MODULES.flatMap((m) => m.lessons);

export const SAMPLE_INVITES = [
  {
    name: "Maya",
    text: "hey Maya — saw you were at Ministry a couple of weeks back. I’m putting on a rooftop thing in London on the 14th, proper house line-up. Reckon it’d be your kind of night?",
  },
  {
    name: "Tom",
    text: "Tom! That Fabric clip from Saturday was unreal. I’ve got a rooftop party running in London on the 14th — same energy, smaller room. Fancy it?",
  },
];
