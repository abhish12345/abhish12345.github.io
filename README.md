# Abhishek Kumar — Personal Portfolio

A fast, accessible portfolio for a Machine Learning & AI Engineer working across NLP, speech and audio, computer vision, and retrieval-augmented generation.

The default page is a clean, recruiter-friendly single-page site. An optional **Hacker Mode** adds a fully interactive, terminal-inspired experience without replacing the default.

**Live site:** [personal-portfolio-jet-nine.vercel.app](https://personal-portfolio-jet-nine.vercel.app)

![Portfolio preview](images/og-cover.jpg)

## Highlights

- Semantic, single-page layout with a clear heading hierarchy and section landmarks
- Responsive from 320 px phones through wide desktop screens
- Accessible tabs, mobile navigation, skip link, visible focus states, and reduced-motion support
- Project details that work with a mouse, keyboard, and touch — no hover-only content
- Contact form with validation, sending state, success feedback, and an email fallback if delivery fails
- Content remains readable when JavaScript is unavailable
- Optional Hacker Mode with a canvas-rendered 3D neural hero, interactive CLI terminal (REPL), Web Audio synthesized sound effects, accessible case-file dialogs, a keyboard-driven command palette, and matrix/CRT toggles
- 6 Production AI Case Files: Enterprise Hybrid RAG & GraphRAG, RoadVision-AI, Talk2DB NL-to-Query Agent, Real-Time Speaker ID, AML Risk Intelligence, and Document Intelligence
- Hacker Mode keeps a no-JS content fallback, honors reduced-motion preferences, and remains usable on small screens
- Self-hosted visual system: inline SVG icons, optimized WebP imagery, no icon libraries or animation frameworks
- SEO metadata, Open Graph/Twitter cards, JSON-LD `Person` schema, `robots.txt`, and `sitemap.xml`
- Security headers and asset caching configured in [`vercel.json`](vercel.json)

## Tech stack

- HTML5
- Modern CSS (custom properties, Grid, Flexbox, `clamp()`)
- Vanilla JavaScript (IntersectionObserver, accessible tabs, mobile drawer, contact form)
- Canvas 2D for the Hacker Mode neural hero and matrix rain — no 3D library or CDN dependency
- Self-hosted Montserrat variable font (37 KB Latin subset) for the clean site
- Self-hosted JetBrains Mono variable font (31 KB Latin subset) for Hacker Mode
- Vercel for static hosting
- Google Apps Script for contact-form delivery

No build step, package manager, or framework is required.

## Run locally

From the project folder, start any static file server. For example:

```bash
python -m http.server 8765
```

Then open [http://localhost:8765](http://localhost:8765).

Opening `index.html` directly also works for layout checks, but a local server is recommended so fonts, images, and the contact endpoint behave like production.

## Hacker Mode

Hacker Mode lives on a separate page so the clean portfolio stays the default and remains fully usable on its own.

- Open [`hacker.html`](hacker.html), or use the **Hacker Mode** button in the clean site header or footer.
- Press `Ctrl/Cmd + K` to open the command palette. Arrow keys move through commands; `Enter` runs the focused command.
- Project cards expose full case-file dialogs built with native `<dialog>` elements, focus handling, and `Escape`-to-close.
- The footer toggles matrix rain and CRT scanlines. Both respect `prefers-reduced-motion`; matrix rain refuses to start when reduced motion is requested.
- A visible **Recruiter Mode** link returns to the clean site from the header, footer, and command palette.
- Without JavaScript, the full content stays visible and interactive-only controls are hidden.
- On small screens the HUD collapses to a single column and the navigation becomes an accessible drawer.

The page currently ships with `<meta name="robots" content="noindex, follow">` so it can be reviewed before being indexed. To make it discoverable, remove that meta tag from `hacker.html` and add the URL to `sitemap.xml`.

Content is duplicated between `index.html` and `hacker.html`, so update both when a role, project, or metric changes.

## Project structure

```text
.
├── index.html          # clean, recruiter-friendly default
├── style.css
├── script.js
├── hacker.html         # optional terminal-inspired experience
├── hacker.css
├── hacker.js
├── images/
│   ├── Abhishek_Kumar_CV.pdf
│   ├── apple-touch-icon.png
│   ├── background.webp
│   ├── favicon.ico
│   ├── logo.webp
│   ├── mobile-bg.webp
│   └── og-cover.jpg
├── fonts/
│   ├── jetbrains-mono-latin-variable.woff2
│   └── montserrat-latin-variable.woff2
├── robots.txt
├── sitemap.xml
├── vercel.json
└── README.md
```

The original `background.png`, `Mobile_bg.png`, and `Logo.jpg` source images are kept in the repository for future edits and excluded from the deployment with [`.vercelignore`](.vercelignore).

## Contact form

The form posts to a Google Apps Script web app. The endpoint is defined near the top of [`script.js`](script.js) and [`hacker.js`](hacker.js):

```js
var CONTACT_ENDPOINT = "https://script.google.com/macros/s/.../exec";
```

To use your own inbox, replace that URL in both files with your Apps Script deployment. The form supports a honeypot field and displays a direct email fallback if the request fails.

## Deployment

The site is designed for Vercel:

1. Push the repository to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Keep the framework preset as **Other** and leave the build command empty.
4. Deploy; Vercel serves the static files from the repository root. Both `index.html` and `hacker.html` are deployed, and Hacker Mode stays `noindex` until its robots meta tag is removed.

Any static host works as well — the site has no server-side dependencies.

## Asset notes

- Hero images are WebP: about 26 KB desktop and 37 KB mobile.
- Montserrat is self-hosted as a 37 KB variable font, so no request is made to Google Fonts.
- JetBrains Mono is self-hosted as a 31 KB variable font for Hacker Mode.
- Logo is a transparent WebP recolored to the site’s cyan/violet palette.
- Social preview is a 1200 × 630 JPEG at about 60 KB.
- Résumé is a compact two-page PDF at about 7 KB.

## License and content

The site content, résumé, and images belong to Abhishek Kumar. Please do not reuse the personal content without permission.
