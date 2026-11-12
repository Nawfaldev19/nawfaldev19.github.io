/** Page copy and data. Plain, specific, first person. Every number here is one I can defend. */

export const LINKS = {
  github: 'https://github.com/Nawfaldev19',
  linkedin: 'https://www.linkedin.com/in/nawfal-imran-886b13218/',
  source: 'https://github.com/Nawfaldev19/nawfaldev19.github.io',
  tixters: 'https://tixters.com',
} as const;

/** Assembled at runtime so the address is not sitting in the HTML for scrapers. */
export function emailAddress(): string {
  const user = ['nawfal', 'imran', 'dev0'].join('.');
  const host = ['gmail', 'com'].join('.');
  return `${user}@${host}`;
}

/** Footer REV. The deploy workflow sets VITE_BUILD_DATE; the fallback is the date this page was first built. */
export const BUILD_DATE = import.meta.env.VITE_BUILD_DATE || '2026-11-12';

export const NAV = [
  { href: '#work', label: 'Work' },
  { href: '#seat-map', label: 'Case studies' },
  { href: '#how-i-work', label: 'How I work' },
  { href: '#contact', label: 'Contact' },
] as const;

export const STACK = ['React', 'TypeScript', 'React Flow', 'Konva', 'Rails', 'GraphQL', 'PostgreSQL'];

export const STATS = ['10 public demos', '1,500+ tests', '<10 → 40–56 FPS'];

export interface Beat {
  no: string;
  title: string;
  body: string;
}

export const BEATS: Beat[] = [
  {
    no: '01',
    title: 'A big diagram editor ran under 10 FPS',
    body: 'Large workflows built from many custom nodes. Dragging a node or panning the canvas stuttered.',
  },
  {
    no: '02',
    title: 'The cause: every change re-rendered the whole tree',
    body: 'A change to one node made every node and edge on the canvas render again, so the cost grew with the size of the diagram.',
  },
  {
    no: '03',
    title: 'Per-node state, decoupled components, memoisation, debounced drag and pan, lazy content',
    body: 'Each node reads only its own state. Components stopped depending on each other, heavy node content loads when it is needed, and drag and pan updates are batched.',
  },
  {
    no: '04',
    title: '40–56 FPS',
    body: 'The same diagrams now move at 40 to 56 frames per second. FIG. 2 runs a scripted before and after on your device.',
  },
];

export type Status = 'Live' | 'Demo';

export interface WorkItem {
  sheet: string;
  title: string;
  slug: string;
  shows: string;
  stack: string[];
  status: Status;
  statusNote?: string;
  links: { label: string; href: string; note?: string }[];
}

export const WORK: WorkItem[] = [
  {
    sheet: '01',
    title: 'Live Canvas',
    slug: 'realtime-reactflow-canvas',
    shows: 'Several people editing one diagram at once: live cursors, connector routing, version history.',
    stack: ['React Flow', 'TypeScript', 'Rails', 'Action Cable'],
    status: 'Live',
    links: [
      {
        label: 'Live demo',
        href: 'https://live-canvas-web.onrender.com',
        note: 'Free hosting: first load can take a minute.',
      },
      { label: 'Repo', href: 'https://github.com/Nawfaldev19/realtime-reactflow-canvas' },
    ],
  },
  {
    sheet: '02',
    title: 'Floorplan Studio',
    slug: 'svg-floorplan-studio',
    shows: 'A floor-plan editor with an embeddable read-only viewer, tested on a 3,000-desk stress floor.',
    stack: ['React 19', 'TypeScript', 'SVG'],
    status: 'Demo',
    statusNote: 'Live link coming',
    links: [{ label: 'Repo', href: 'https://github.com/Nawfaldev19/svg-floorplan-studio' }],
  },
  {
    sheet: '03',
    title: 'Booking Kiosk',
    slug: 'rails-booking-kiosk',
    shows: 'Double booking refused by the database itself, 5-minute holds, and a front-desk kiosk.',
    stack: ['Rails 8', 'GraphQL', 'PostgreSQL', 'React'],
    status: 'Demo',
    links: [{ label: 'Repo', href: 'https://github.com/Nawfaldev19/rails-booking-kiosk' }],
  },
];

export const FAQ = [
  { q: 'Time zone?', a: 'Lahore, UTC+5. Flexible overlap with US and European hours.' },
  { q: 'Contract types?', a: 'Employment, contractor, or through an employer-of-record.' },
  { q: 'Where’s your work?', a: 'Public demos on GitHub; client work under NDA, walked through in interviews.' },
];
