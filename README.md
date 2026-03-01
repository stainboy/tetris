# Tetris

A classic Tetris game built with React, TypeScript, and Vite. No external game libraries — just pure React with hooks.

![Tetris Screenshot](screenshot.png)

## Features

- All 7 standard tetrominoes (I, O, T, S, Z, J, L) with full rotation
- Ghost piece showing where the current piece will land
- Hard drop and soft drop
- Next piece preview
- Score tracking with line-clear bonuses
- Level progression with increasing speed
- Pause and restart functionality

## Controls

| Key | Action |
|-----|--------|
| Left / Right Arrow | Move piece horizontally |
| Down Arrow | Soft drop |
| Up Arrow | Rotate piece |
| Space | Hard drop |

## Scoring

| Action | Points |
|--------|--------|
| 1 line cleared | 100 |
| 2 lines cleared | 300 |
| 3 lines cleared | 500 |
| 4 lines cleared (Tetris) | 800 |
| Hard drop | 2 per row dropped |

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Install & Run

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## Tech Stack

- **React 18** — UI rendering
- **TypeScript** — Type safety
- **Vite** — Build tooling
