export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Piece {
  type: PieceType
  rotation: number
  row: number
  col: number
}

export type Cell = PieceType | null
export type Board = Cell[][]

export interface GameState {
  board: Board
  current: Piece
  next: Piece
  score: number
  lines: number
  level: number
  gameOver: boolean
  started: boolean
  isLocking: boolean // Prevents race conditions during piece lock
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'MOVE_DOWN' }
  | { type: 'MOVE'; payload: number }
  | { type: 'ROTATE' }
  | { type: 'HARD_DROP' }
  | { type: 'LOCK_PIECE' }
  | { type: 'GAME_OVER' }
