// Programmatic SVG data URI generators for placeholder assets
// These are used when actual Lottie/image assets are not yet available

import { EID_DARK, EID_GOLD, EID_PINK, EID_GREEN, EID_BLUE, EID_TRUCKER_YELLOW } from "./colors";

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ── Background Placeholders ──────────────────────────────────────

export function mountainRoadBackground(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a0533"/>
          <stop offset="60%" stop-color="#2d1b69"/>
          <stop offset="100%" stop-color="#4a2c8a"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#sky)"/>
      <polygon points="0,1200 300,800 540,1000 780,700 1080,900 1080,1920 0,1920" fill="#1a1a2e" opacity="0.8"/>
      <line x1="400" y1="1920" x2="540" y2="900" stroke="#555" stroke-width="4" opacity="0.4"/>
      <line x1="680" y1="1920" x2="540" y2="900" stroke="#555" stroke-width="4" opacity="0.4"/>
      <text x="540" y="960" text-anchor="middle" fill="#888" font-size="36">Mountain Road</text>
    </svg>
  `);
}

export function truckerPanelBackground(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <rect width="1080" height="1920" fill="#2a1a00"/>
      <rect x="40" y="40" width="1000" height="1840" rx="20" fill="none" stroke="${EID_TRUCKER_YELLOW}" stroke-width="8"/>
      <rect x="80" y="80" width="920" height="1760" rx="10" fill="none" stroke="${EID_TRUCKER_YELLOW}" stroke-width="3" stroke-dasharray="20,10"/>
      <text x="540" y="960" text-anchor="middle" fill="${EID_TRUCKER_YELLOW}" font-size="36">Trucker Panel</text>
    </svg>
  `);
}

export function desertHighwayBackground(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="desert" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff6b35"/>
          <stop offset="50%" stop-color="#f7c59f"/>
          <stop offset="100%" stop-color="#efefd0"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#desert)"/>
      <polygon points="380,1920 540,1000 700,1920" fill="#555" opacity="0.5"/>
      <line x1="540" y1="1000" x2="540" y2="1920" stroke="#FFD700" stroke-width="3" stroke-dasharray="30,20"/>
      <text x="540" y="960" text-anchor="middle" fill="#333" font-size="36">Desert Highway</text>
    </svg>
  `);
}

// ── Decorative Placeholders ──────────────────────────────────────

export function truckerArtBorder(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <rect x="10" y="10" width="180" height="180" rx="5" fill="none" stroke="${EID_TRUCKER_YELLOW}" stroke-width="4"/>
      <rect x="20" y="20" width="160" height="160" rx="3" fill="none" stroke="${EID_TRUCKER_YELLOW}" stroke-width="2" stroke-dasharray="8,4"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke="${EID_TRUCKER_YELLOW}" stroke-width="2"/>
    </svg>
  `);
}

export function truckerArtChain(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">
      ${Array.from({ length: 8 }, (_, i) => {
        const cx = 15 + i * 25;
        return `<ellipse cx="${cx}" cy="20" rx="12" ry="8" fill="none" stroke="${EID_GOLD}" stroke-width="2"/>`;
      }).join("")}
    </svg>
  `);
}

export function truckerArtPeacock(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="140" r="15" fill="${EID_BLUE}"/>
      ${Array.from({ length: 7 }, (_, i) => {
        const angle = -90 + (i - 3) * 25;
        const rad = (angle * Math.PI) / 180;
        const x2 = 100 + Math.cos(rad) * 80;
        const y2 = 140 + Math.sin(rad) * 80;
        const colors = [EID_GREEN, EID_BLUE, EID_GOLD];
        return `<line x1="100" y1="140" x2="${x2}" y2="${y2}" stroke="${colors[i % 3]}" stroke-width="3"/>
                <circle cx="${x2}" cy="${y2}" r="8" fill="${colors[i % 3]}" opacity="0.8"/>`;
      }).join("")}
    </svg>
  `);
}

export function crescentMoon(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <circle cx="100" cy="100" r="60" fill="${EID_GOLD}"/>
      <circle cx="125" cy="85" r="50" fill="${EID_DARK}"/>
    </svg>
  `);
}

export function goldParticles(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      ${Array.from({ length: 20 }, () => {
        const x = Math.floor(Math.random() * 200);
        const y = Math.floor(Math.random() * 200);
        const r = 1 + Math.floor(Math.random() * 3);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="${EID_GOLD}" opacity="${0.3 + Math.random() * 0.7}"/>`;
      }).join("")}
    </svg>
  `);
}

// Use seeded values for reproducible output in tests
export function goldParticlesDeterministic(): string {
  const particles = [
    { x: 23, y: 145, r: 2, o: 0.8 },
    { x: 67, y: 34, r: 1, o: 0.5 },
    { x: 120, y: 89, r: 3, o: 0.9 },
    { x: 178, y: 167, r: 2, o: 0.6 },
    { x: 45, y: 102, r: 1, o: 0.7 },
    { x: 156, y: 12, r: 2, o: 0.4 },
    { x: 89, y: 178, r: 3, o: 0.9 },
    { x: 134, y: 56, r: 1, o: 0.5 },
    { x: 12, y: 67, r: 2, o: 0.8 },
    { x: 190, y: 134, r: 1, o: 0.6 },
  ];
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      ${particles.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${EID_GOLD}" opacity="${p.o}"/>`).join("")}
    </svg>
  `);
}

export function sparkleOverlay(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      ${[
        { x: 50, y: 50 },
        { x: 150, y: 30 },
        { x: 100, y: 150 },
        { x: 30, y: 120 },
        { x: 170, y: 170 },
      ]
        .map(
          (p) =>
            `<polygon points="${p.x},${p.y - 10} ${p.x + 3},${p.y - 3} ${p.x + 10},${p.y} ${p.x + 3},${p.y + 3} ${p.x},${p.y + 10} ${p.x - 3},${p.y + 3} ${p.x - 10},${p.y} ${p.x - 3},${p.y - 3}" fill="${EID_GOLD}" opacity="0.8"/>`
        )
        .join("")}
    </svg>
  `);
}

export function roseHeart(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <path d="M100,180 C60,140 10,110 10,70 C10,30 50,10 100,50 C150,10 190,30 190,70 C190,110 140,140 100,180Z" fill="${EID_PINK}" opacity="0.8"/>
      <circle cx="80" cy="80" r="15" fill="#ff4444" opacity="0.6"/>
      <circle cx="120" cy="80" r="15" fill="#ff4444" opacity="0.6"/>
      <circle cx="100" cy="100" r="12" fill="#ff4444" opacity="0.6"/>
    </svg>
  `);
}

export function kiteDiamond(): string {
  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <polygon points="100,20 160,100 100,180 40,100" fill="${EID_PINK}" stroke="${EID_GOLD}" stroke-width="3"/>
      <line x1="100" y1="20" x2="100" y2="180" stroke="${EID_GOLD}" stroke-width="1"/>
      <line x1="40" y1="100" x2="160" y2="100" stroke="${EID_GOLD}" stroke-width="1"/>
      <line x1="100" y1="180" x2="100" y2="200" stroke="#888" stroke-width="1" stroke-dasharray="4,2"/>
    </svg>
  `);
}

// ── Resolution Helpers ───────────────────────────────────────────

const PLACEHOLDER_PREFIX = "placeholder:";

export function isPlaceholderSource(source: string): boolean {
  return source.startsWith(PLACEHOLDER_PREFIX);
}

const placeholderMap: Record<string, () => string> = {
  "placeholder:mountain-road": mountainRoadBackground,
  "placeholder:trucker-panel": truckerPanelBackground,
  "placeholder:desert-highway": desertHighwayBackground,
  "placeholder:trucker-art-border": truckerArtBorder,
  "placeholder:trucker-art-chain": truckerArtChain,
  "placeholder:trucker-art-peacock": truckerArtPeacock,
  "placeholder:crescent-moon": crescentMoon,
  "placeholder:gold-particles": goldParticlesDeterministic,
  "placeholder:sparkle-overlay": sparkleOverlay,
  "placeholder:rose-heart": roseHeart,
  "placeholder:kite-diamond": kiteDiamond,
};

export function resolvePlaceholder(source: string): string | null {
  const generator = placeholderMap[source];
  return generator ? generator() : null;
}
