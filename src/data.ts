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

export const links = [
  { label: 'GitHub', url: 'https://github.com/s3hq4y' },
  { label: 'Portal', url: 'https://github.com/s3hq4y/portal' },
  { label: 'Wibe', url: 'https://github.com/s3hq4y/wibe' },
];

export const strings: Record<Lang, Record<string, string>> = {
  zh: {
    'nav.work': '作品',
    'nav.about': '关于',
    'nav.contact': '联系',
    'nav.blog': '博客',
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
    'contact.title': '联系',
    'contact.lead': '有项目、合作，或只是想聊聊 MCP 与 3D？',
    'footer.copy': '© 2026 s3hq4y（s9y）· 用代码与光构建',
    'footer.built': 'Babylon.js · TypeScript · Vite',
  },
  en: {
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
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
    'contact.title': 'Contact',
    'contact.lead': 'Got a project, a collaboration, or just want to talk MCP and 3D?',
    'footer.copy': '© 2026 s3hq4y (s9y) · Built with code and light',
    'footer.built': 'Babylon.js · TypeScript · Vite',
  },
};