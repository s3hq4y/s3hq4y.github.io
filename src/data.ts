export type Lang = 'zh' | 'en';

export interface Project {
  name: string;
  tag: Record<Lang, string>;
  desc: Record<Lang, string>;
  topics: string[];
  language: string;
  license: string;
  stars: number;
  url: string;
  accent: string;
}

export const projects: Project[] = [
  {
    name: 'Portal',
    tag: { zh: '公共 MCP 端点 · 隧道桥接', en: 'Public MCP endpoint · tunnel bridge' },
    desc: {
      zh: '把一个 MCP 服务通过隧道暴露到公网，让编辑器、Agent 与浏览器客户端即插即用。包含隧道客户端、服务端、VS Code 扩展与网关。',
      en: 'Exposes an MCP server to the public web through a tunnel, so editors, agents and browser clients plug in instantly. Ships a tunnel client, server, VS Code extension and gateway.',
    },
    topics: ['mcp', 'agent', 'tunnel', 'vscode-extension'],
    language: 'TypeScript',
    license: 'GPL-3.0',
    stars: 22,
    url: 'https://github.com/s3hq4y/portal',
    accent: '#ff2d6f',
  },
  {
    name: 'Wibe',
    tag: { zh: 'Vibe Coding · 浏览器代理', en: 'Vibe coding · browser-backed agent' },
    desc: {
      zh: '一个由浏览器驱动的编码代理（UWA），配上自定义 Agent 扩展：在真实网页环境里观察、操作、生成，把凭感觉写代码变成可复现的工作流。',
      en: 'A browser-backed coding agent (UWA) plus a custom agent extension: it observes, operates and generates inside a real web environment, turning vibe coding into a reproducible workflow.',
    },
    topics: ['agentic-ai', 'browser-automation', 'vibe-coding', 'code-oss'],
    language: 'TypeScript',
    license: 'AGPL-3.0',
    stars: 3,
    url: 'https://github.com/s3hq4y/wibe',
    accent: '#4d7cff',
  },
];

export const chips = ['TypeScript', 'Babylon.js', 'MCP', 'WebGL', 'Vite'];

export const marquee = [
  'mcp', 'agentic-ai', 'tunnel', 'browser-automation', 'vibe-coding',
  'vscode-extension', 'code-oss', 'typescript', 'webgl', 'real-time-3d',
];

// Technical skills, mirrored from readme/assets/skills.svg (grouped).
export const skillGroups: { label: string; items: string[] }[] = [
  {
    label: 'languages',
    items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'PHP', 'SQL'],
  },
  {
    label: 'frontend',
    items: [
      'React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Redux', 'React Native',
      'Tailwind', 'SCSS', 'Material-UI', 'Framer Motion', 'GSAP', 'PWA',
    ],
  },
  {
    label: 'graphics',
    items: ['Three.js', 'React Three Fiber', 'Babylon.js', 'PlayCanvas', 'PixiJS', 'Spine', 'WebGL'],
  },
  {
    label: 'backend',
    items: ['Node.js', 'Express', 'NestJS', 'Laravel', 'CodeIgniter', 'GraphQL', 'Apollo', 'REST'],
  },
  {
    label: 'data',
    items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Prisma'],
  },
  {
    label: 'infra',
    items: ['Docker', 'AWS', 'Nginx', 'Caddy', 'Git', 'NX', 'Jest'],
  },
];

// Flat list for the About skill-flow canvas (deduped, order kept).
export const skills: string[] = [
  ...skillGroups.flatMap((g) => g.items),
];

// CIV — the game section. Screenshots live in public/civ/ (see README).
export const civGallery: { src: string; alt: Record<Lang, string> }[] = [
  {
    src: '/civ/globe-atlantic.jpg',
    alt: { zh: '地球模式：大西洋视角下的非洲与欧亚大陆', en: 'Globe mode: Africa and Eurasia over the Atlantic' },
  },
  {
    src: '/civ/globe-americas.jpg',
    alt: { zh: '地球模式：南美洲与真实大陆', en: 'Globe mode: South America on the real continents' },
  },
  {
    src: '/civ/political.jpg',
    alt: { zh: '政治地图模式：整省刷色的列国领土', en: 'Political map mode: provinces painted by owner' },
  },
  {
    src: '/civ/terrain.jpg',
    alt: { zh: '地形地图模式：按高程分类的真实地形', en: 'Terrain map mode: real elevation-classified terrain' },
  },
  {
    src: '/civ/units.jpg',
    alt: { zh: '军队圆标与行军箭头', en: 'Army markers and march arrows' },
  },
];

export const civFeatures: { key: string }[] = [
  { key: 'f1' },
  { key: 'f2' },
  { key: 'f3' },
  { key: 'f4' },
  { key: 'f5' },
  { key: 'f6' },
];

export const links = [
  { label: 'GitHub', url: 'https://github.com/s3hq4y' },
  { label: 'Portal', url: 'https://github.com/s3hq4y/portal' },
  { label: 'Wibe', url: 'https://github.com/s3hq4y/wibe' },
  { label: 'CIV', url: 'https://civ.s9y.workers.dev/' },
];

export const strings: Record<Lang, Record<string, string>> = {
  zh: {
    'nav.work': '作品',
    'nav.civGame': '游戏',
    'nav.about': '关于',
    'nav.contact': '联系',
    'nav.blog': '博客',
    'nav.civ': 'CIV',
    'nav.space': '空间',
    'hero.eyebrow': '视觉作品集 · 2026',
    'hero.t1': '从零构建',
    'hero.t2': '有重力的界面',
    'hero.sub': '我是 s3hq4y（s9y）。用 TypeScript 与实时 3D 打造网页系统、交互工具与代理基础设施。',
    'hero.ctaWork': '查看作品',
    'hero.ctaContact': '联系我',
    'hero.scroll': '滚动',
    'work.title': '精选作品',
    'work.desc': '两个正在生长的开源系统 —— 都在浏览器与编辑器的边界上工作。',
    'work.repo': '查看仓库',
    'about.title': '关于',
    'about.p1': '我做网页系统与开发者工具。比起堆叠框架，我更愿意从零推导结构 —— 把一条隧道、一个代理循环，或一片 3D 场，老老实实写进浏览器里。',
    'about.p2': '关注点：性能、动效的物理感，以及那些让人愿意多停留一秒的细节。',
    'civ.num': '02',
    'civ.eyebrow': '可玩 · 浏览器大策略',
    'civ.title': 'Civ · 极简大策略',
    'civ.lede': 'EU4 风格的浏览器大战略游戏 —— 数据驱动、可 mod、可扩展。把地图、经济、战争、外交、科技与殖民，老老实实写进一个纯前端页面里。',
    'civ.play': '开始游玩',
    'civ.m1': '11 国 · 560 省',
    'civ.m2': '殖民 · 真实地球',
    'civ.m3': '409 项测试',
    'civ.m4': '全数据驱动',
    'civ.featuresTitle': '已实现',
    'civ.f1.t': 'M1 · 地图',
    'civ.f1.d': 'Voronoi 省份 + 海洋 + 地形，同一种子生成完全相同的世界。',
    'civ.f2.t': 'M2 · 经济',
    'civ.f2.d': '税收、建筑、贷款、通胀与稳定度，逐月结算，Modifier 栈可追溯每个数字的来源。',
    'civ.f3.t': 'M3 · 战争',
    'civ.f3.d': '招募、寻路、会战、围城、战争分数与和约，配上效用打分的 AI。',
    'civ.f4.t': 'M3.5 · 外交',
    'civ.f4.d': '关系度、同盟、保障、宿敌、附庸与通行权，还有触发多方联合阵线的侵略扩张度。',
    'civ.f5.t': 'M4–M5 · 科技与事件',
    'civ.f5.d': '君主点数、理念组、君主与将领、事件链、看海模式、控制台与古典配色。',
    'civ.f6.t': 'M6 · 殖民与地球',
    'civ.f6.d': '海路拓新地，或直接在真实地球 1,002 省上玩 —— 历史 1444 与幻想随机两个场景。',
    'civ.techTitle': '技术栈',
    'civ.tech': 'TypeScript · React 19 · PixiJS 8 · Babylon.js · Zustand · Tailwind 4 · Vitest · Vite 8',
    'civ.note': '引擎零 UI 依赖，可脱离浏览器跑几百年的 AI 自动对战来验证平衡性；每个数字都在 JSON 里，一个文件即可模组化。',
    'contact.title': '联系',
    'contact.lead': '有项目、合作，或只是想聊聊 MCP 与 3D？',
    'footer.copy': '© 2026 s3hq4y（s9y）· 用代码与光构建',
    'footer.built': 'Babylon.js · TypeScript · Vite',
  },
  en: {
    'nav.work': 'Work',
    'nav.civGame': 'Game',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.civ': 'CIV',
    'nav.space': 'Space',
    'hero.eyebrow': 'Visual portfolio · 2026',
    'hero.t1': 'Built from zero',
    'hero.t2': 'interfaces with gravity',
    'hero.sub': 'I am s3hq4y (s9y). I build web systems, interactive tools and agent infrastructure with TypeScript and real-time 3D.',
    'hero.ctaWork': 'View work',
    'hero.ctaContact': 'Get in touch',
    'hero.scroll': 'Scroll',
    'work.title': 'Selected Work',
    'work.desc': 'Two open-source systems in the making — both working at the edge of the browser and the editor.',
    'work.repo': 'View repo',
    'about.title': 'About',
    'about.p1': 'I build web systems and developer tools. Rather than stacking frameworks, I prefer deriving structure from zero — writing a tunnel, an agent loop, or a 3D field honestly into the browser.',
    'about.p2': 'Focus: performance, the physicality of motion, and the details that make you stay one more second.',
    'civ.num': '02',
    'civ.eyebrow': 'Playable · Browser grand strategy',
    'civ.title': 'Civ · Minimal Grand Strategy',
    'civ.lede': 'An EU4-style grand strategy game in the browser — data-driven, moddable, extensible. Map, economy, war, diplomacy, technology and colonization, written honestly into a pure front-end page.',
    'civ.play': 'Play now',
    'civ.m1': '11 nations · 560 provinces',
    'civ.m2': 'Colonies · real Earth',
    'civ.m3': '409 tests',
    'civ.m4': 'Fully data-driven',
    'civ.featuresTitle': 'Shipped',
    'civ.f1.t': 'M1 · Map',
    'civ.f1.d': 'Voronoi provinces, oceans and terrain; the same seed always yields the same world.',
    'civ.f2.t': 'M2 · Economy',
    'civ.f2.d': 'Tax, buildings, loans, inflation and stability settled monthly, with a modifier stack tracing every number to its source.',
    'civ.f3.t': 'M3 · War',
    'civ.f3.d': 'Recruitment, pathfinding, battles, sieges, war score and peace deals, driven by a utility-scoring AI.',
    'civ.f4.t': 'M3.5 · Diplomacy',
    'civ.f4.d': 'Opinion, alliances, guarantees, rivals, vassals and military access — plus aggressive expansion that triggers coalition wars.',
    'civ.f5.t': 'M4–M5 · Tech & Events',
    'civ.f5.d': 'Monarch points, idea groups, rulers and generals, event chains, observe mode, a console and a classical palette.',
    'civ.f6.t': 'M6 · Colonization & Earth',
    'civ.f6.d': 'Colonize by sea, or play directly on the real Earth in 1,002 provinces — historical 1444 and fantasy random scenarios.',
    'civ.techTitle': 'Stack',
    'civ.tech': 'TypeScript · React 19 · PixiJS 8 · Babylon.js · Zustand · Tailwind 4 · Vitest · Vite 8',
    'civ.note': 'The engine has zero UI dependencies, so it can run centuries of headless AI wars to validate balance; every number lives in JSON, so a single file makes it moddable.',
    'contact.title': 'Contact',
    'contact.lead': 'Got a project, a collaboration, or just want to talk MCP and 3D?',
    'footer.copy': '© 2026 s3hq4y (s9y) · Built with code and light',
    'footer.built': 'Babylon.js · TypeScript · Vite',
  },
};