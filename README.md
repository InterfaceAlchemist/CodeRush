# ⌨️ CodeRush — Typing Speed Test (Coding Edition)

A typing speed test built for developers — instead of typing random prose, you type real JavaScript, PHP, and SQL snippets, complete with syntax highlighting, proper indentation, and code-editor styling.

Originally based on the [Frontend Mentor "Typing Speed Test" challenge](https://www.frontendmentor.io/challenges/typing-speed-test), rebuilt with Vue 3 and extended well beyond the original brief.

**🔗 Live demo:** [coderush-snowy.vercel.app](https://coderush-snowy.vercel.app/)

---

## Features

- **Multi-language snippets** — JavaScript, PHP, and SQL, each with Easy/Medium/Hard difficulty tiers
- **Syntax highlighting** — keywords, strings, and numbers are color-coded before you even start typing
- **Code-editor UI** — macOS-style window chrome, line numbers, and monospace styling
- **Smart Tab indentation** — pressing Tab fills in the exact indentation the snippet needs, no matter if it's 2-space or 4-space style
- **Two test modes** — 60-second timed mode, or untimed passage mode (finish at your own pace)
- **No-repeat randomization** — won't show you the same snippet twice in a row
- **Retry or reroll** — retry the exact snippet you just typed, or get a fresh random one
- **Error breakdown** — see exactly which characters you mistype most often
- **Run history & trend chart** — tracks your last 10 runs and graphs your WPM over time
- **Custom snippet input** — paste your own code and practice typing that instead
- **Sound effects** — audio feedback for correct/incorrect keystrokes and test completion (with a mute toggle)
- **Persistent settings** — remembers your last language, difficulty, and mode across visits
- **Personal best tracking** — saved locally, with a celebration screen when you beat your record
- **Fully responsive** — works on desktop and mobile

## Tech Stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- Vanilla Web Audio API for sound effects (no external audio files)
- `localStorage` for all persistence — no backend required

## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/InterfaceAlchemist/CodeRush-Typing-Speed-Test---Coding-Edition.git
cd CodeRush-Typing-Speed-Test---Coding-Edition
npm install
```

Run the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview   # serve the production build locally
```

## Project Structure

```
src/
├── components/
│   ├── AppHeader.vue          # Logo, personal best, sound toggle
│   ├── ControlsBar.vue        # Language/Difficulty/Mode selectors + stats
│   ├── TypingPassage.vue      # The code display, input capture, editor chrome
│   ├── CustomSnippetInput.vue # Paste-your-own-code panel
│   └── ResultsScreen.vue      # Post-test stats, chart, error breakdown
├── composables/
│   ├── useTypingTest.js       # Core test logic — timing, scoring, state
│   └── useSounds.js           # Web Audio API sound effect generation
├── data/
│   └── snippets.json          # 150+ code snippets across 3 languages × 3 difficulties
├── utils/
│   └── tokenizer.js           # Lightweight syntax highlighter
└── App.vue                    # Top-level wiring
```

## Credits

- Challenge design and starter assets from [Frontend Mentor](https://www.frontendmentor.io)
- Built by [Interface Alchemist](https://github.com/InterfaceAlchemist)
