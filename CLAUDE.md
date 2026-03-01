# Tetris

React + TypeScript + Vite Tetris game.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Type-check and build for production
- `npm run preview` — Preview production build

## Project Structure

- `src/App.tsx` — All game logic and rendering (single-component architecture)
- `src/App.css` — Game styles (board, pieces, sidebar, overlays)
- `src/index.css` — Global/reset styles
- `src/main.tsx` — React entry point

## Architecture

The game is built as a single React component in `App.tsx`:
- **Board**: 10x20 grid stored as a 2D array of `PieceType | null`
- **Pieces**: 7 standard tetrominoes (I, O, T, S, Z, J, L) with 4 rotation states each
- **Game loop**: `setInterval` driven by level speed, cleaned up via `useEffect`
- **Input**: Keyboard events (arrow keys + space) bound in `useEffect`
- **Ghost piece**: Shows where the current piece will land
- **Scoring**: 100/300/500/800 points for 1/2/3/4 lines; 2 points per hard-drop row
- **Levels**: Every 10 lines increases level; speed scales from 800ms down to 100ms

## Conventions

- No external game libraries — pure React with hooks
- All state managed via `useState`; refs used for access inside callbacks
- TypeScript strict mode enabled
