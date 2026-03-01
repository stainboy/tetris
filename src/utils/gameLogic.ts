import type { Piece, Board } from '../types'
import { COLS, ROWS, SHAPES, PIECE_TYPES } from '../constants'

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export function randomPiece(): Piece {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  const shape = SHAPES[type][0]
  // Center the piece horizontally
  const col = Math.floor((COLS - shape[0].length) / 2)
  return { type, rotation: 0, row: 0, col }
}

export function getShape(piece: Piece): number[][] {
  return SHAPES[piece.type][piece.rotation]
}

/**
 * Check if a piece collides with the board or boundaries.
 * Fixed boundary check to properly validate all shape cells.
 */
export function collides(
  board: Board,
  piece: Piece,
  rowOff: number,
  colOff: number,
  rotation?: number
): boolean {
  const shape = SHAPES[piece.type][rotation ?? piece.rotation]
  const shapeHeight = shape.length
  const shapeWidth = shape[0]?.length ?? 0

  for (let r = 0; r < shapeHeight; r++) {
    for (let c = 0; c < shapeWidth; c++) {
      if (!shape[r][c]) continue

      const nr = piece.row + r + rowOff
      const nc = piece.col + c + colOff

      // Boundary checks
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) {
        return true
      }

      // Collision with locked pieces
      if (board[nr][nc]) {
        return true
      }
    }
  }
  return false
}

export function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map(row => [...row])
  const shape = getShape(piece)

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue

      const nr = piece.row + r
      const nc = piece.col + c

      // Additional safety check to ensure we only write within bounds
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        newBoard[nr][nc] = piece.type
      }
    }
  }
  return newBoard
}

export function clearLines(board: Board): { board: Board; linesCleared: number } {
  const remaining = board.filter(row => row.some(cell => cell === null))
  const linesCleared = ROWS - remaining.length
  const emptyRows: Board = Array.from({ length: linesCleared }, () => Array(COLS).fill(null))
  return { board: [...emptyRows, ...remaining], linesCleared }
}

export function getGhostRow(board: Board, piece: Piece): number {
  let offset = 0
  while (!collides(board, piece, offset + 1, 0)) {
    offset++
  }
  return piece.row + offset
}

export function calculateLevel(lines: number): number {
  return Math.floor(lines / 10) + 1
}

export function calculateSpeed(level: number): number {
  return Math.max(100, 800 - (level - 1) * 70)
}

export function spawnPiece(nextPiece: Piece): Piece {
  const shape = SHAPES[nextPiece.type][0]
  const col = Math.floor((COLS - shape[0].length) / 2)
  return {
    type: nextPiece.type,
    rotation: 0,
    row: 0,
    col
  }
}

/**
 * Check if a piece can be spawned without collision.
 * Used at game start or when spawning a new piece.
 */
export function canSpawnPiece(board: Board, piece: Piece): boolean {
  return !collides(board, piece, 0, 0)
}
