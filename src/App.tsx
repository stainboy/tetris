import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

const COLS = 10
const ROWS = 20

type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

const SHAPES: Record<PieceType, number[][][]> = {
  I: [
    [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    [[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],
    [[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],
    [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
  ],
  O: [
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
    [[1,1],[1,1]],
  ],
  T: [
    [[0,1,0],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,1],[0,1,0]],
    [[0,1,0],[1,1,0],[0,1,0]],
  ],
  S: [
    [[0,1,1],[1,1,0],[0,0,0]],
    [[0,1,0],[0,1,1],[0,0,1]],
    [[0,0,0],[0,1,1],[1,1,0]],
    [[1,0,0],[1,1,0],[0,1,0]],
  ],
  Z: [
    [[1,1,0],[0,1,1],[0,0,0]],
    [[0,0,1],[0,1,1],[0,1,0]],
    [[0,0,0],[1,1,0],[0,1,1]],
    [[0,1,0],[1,1,0],[1,0,0]],
  ],
  J: [
    [[1,0,0],[1,1,1],[0,0,0]],
    [[0,1,1],[0,1,0],[0,1,0]],
    [[0,0,0],[1,1,1],[0,0,1]],
    [[0,1,0],[0,1,0],[1,1,0]],
  ],
  L: [
    [[0,0,1],[1,1,1],[0,0,0]],
    [[0,1,0],[0,1,0],[0,1,1]],
    [[0,0,0],[1,1,1],[1,0,0]],
    [[1,1,0],[0,1,0],[0,1,0]],
  ],
}

const PIECE_TYPES: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

interface Piece {
  type: PieceType
  rotation: number
  row: number
  col: number
}

type Cell = PieceType | null
type Board = Cell[][]

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function randomPiece(): Piece {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)]
  const shape = SHAPES[type][0]
  return { type, rotation: 0, row: 0, col: Math.floor((COLS - shape[0].length) / 2) }
}

function getShape(piece: Piece): number[][] {
  return SHAPES[piece.type][piece.rotation]
}

function collides(board: Board, piece: Piece, rowOff: number, colOff: number, rotation?: number): boolean {
  const shape = SHAPES[piece.type][rotation ?? piece.rotation]
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nr = piece.row + r + rowOff
      const nc = piece.col + c + colOff
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return true
      if (board[nr][nc]) return true
    }
  }
  return false
}

function lockPiece(board: Board, piece: Piece): Board {
  const newBoard = board.map(row => [...row])
  const shape = getShape(piece)
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue
      const nr = piece.row + r
      const nc = piece.col + c
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
        newBoard[nr][nc] = piece.type
      }
    }
  }
  return newBoard
}

function clearLines(board: Board): { board: Board; linesCleared: number } {
  const remaining = board.filter(row => row.some(cell => cell === null))
  const linesCleared = ROWS - remaining.length
  const emptyRows: Board = Array.from({ length: linesCleared }, () => Array(COLS).fill(null))
  return { board: [...emptyRows, ...remaining], linesCleared }
}

function getGhostRow(board: Board, piece: Piece): number {
  let offset = 0
  while (!collides(board, piece, offset + 1, 0)) {
    offset++
  }
  return piece.row + offset
}

const POINTS = [0, 100, 300, 500, 800]

function App() {
  const [board, setBoard] = useState<Board>(createBoard)
  const [current, setCurrent] = useState<Piece>(randomPiece)
  const [next, setNext] = useState<Piece>(randomPiece)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [started, setStarted] = useState(false)

  const boardRef = useRef(board)
  const currentRef = useRef(current)
  const nextRef = useRef(next)
  const gameOverRef = useRef(gameOver)

  boardRef.current = board
  currentRef.current = current
  nextRef.current = next
  gameOverRef.current = gameOver

  const spawnPiece = useCallback(() => {
    const np = nextRef.current
    const spawn: Piece = { ...np, row: 0, col: Math.floor((COLS - SHAPES[np.type][0][0].length) / 2) }
    if (collides(boardRef.current, spawn, 0, 0)) {
      setGameOver(true)
      return
    }
    setCurrent(spawn)
    setNext(randomPiece())
  }, [])

  const lock = useCallback(() => {
    const locked = lockPiece(boardRef.current, currentRef.current)
    const { board: cleared, linesCleared } = clearLines(locked)
    setBoard(cleared)
    setScore(s => s + POINTS[linesCleared])
    setLines(l => {
      const newLines = l + linesCleared
      setLevel(Math.floor(newLines / 10) + 1)
      return newLines
    })
    spawnPiece()
  }, [spawnPiece])

  const moveDown = useCallback(() => {
    if (gameOverRef.current) return
    if (collides(boardRef.current, currentRef.current, 1, 0)) {
      lock()
    } else {
      setCurrent(p => ({ ...p, row: p.row + 1 }))
    }
  }, [lock])

  const hardDrop = useCallback(() => {
    if (gameOverRef.current) return
    const ghost = getGhostRow(boardRef.current, currentRef.current)
    const dropDistance = ghost - currentRef.current.row
    setCurrent(p => ({ ...p, row: ghost }))
    setScore(s => s + dropDistance * 2)
    // Lock on next tick so state updates
    setTimeout(() => lock(), 0)
  }, [lock])

  const move = useCallback((colOff: number) => {
    if (gameOverRef.current) return
    if (!collides(boardRef.current, currentRef.current, 0, colOff)) {
      setCurrent(p => ({ ...p, col: p.col + colOff }))
    }
  }, [])

  const rotate = useCallback(() => {
    if (gameOverRef.current) return
    const newRot = (currentRef.current.rotation + 1) % 4
    // Try basic rotation, then wall kicks
    const kicks = [0, -1, 1, -2, 2]
    for (const kick of kicks) {
      if (!collides(boardRef.current, currentRef.current, 0, kick, newRot)) {
        setCurrent(p => ({ ...p, rotation: newRot, col: p.col + kick }))
        return
      }
    }
  }, [])

  // Game loop
  useEffect(() => {
    if (!started || gameOver) return
    const speed = Math.max(100, 800 - (level - 1) * 70)
    const id = setInterval(moveDown, speed)
    return () => clearInterval(id)
  }, [started, gameOver, level, moveDown])

  // Keyboard
  useEffect(() => {
    if (!started || gameOver) return
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); move(-1); break
        case 'ArrowRight': e.preventDefault(); move(1); break
        case 'ArrowDown': e.preventDefault(); moveDown(); break
        case 'ArrowUp': e.preventDefault(); rotate(); break
        case ' ': e.preventDefault(); hardDrop(); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [started, gameOver, move, moveDown, rotate, hardDrop])

  const startGame = () => {
    const b = createBoard()
    const c = randomPiece()
    const n = randomPiece()
    setBoard(b)
    setCurrent(c)
    setNext(n)
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setStarted(true)
  }

  // Render the board with the current piece and ghost overlaid
  const ghostRow = getGhostRow(board, current)
  const ghostPiece: Piece = { ...current, row: ghostRow }
  const shape = getShape(current)
  const ghostShape = getShape(ghostPiece)

  const renderBoard = () => {
    const cells: JSX.Element[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let cellType = board[r][c]
        let isGhost = false

        // Ghost piece
        if (!cellType && started) {
          const gr = r - ghostPiece.row
          const gc = c - ghostPiece.col
          if (gr >= 0 && gr < ghostShape.length && gc >= 0 && gc < ghostShape[0].length && ghostShape[gr][gc]) {
            cellType = ghostPiece.type
            isGhost = true
          }
        }

        // Current piece (overwrites ghost)
        if (started) {
          const pr = r - current.row
          const pc = c - current.col
          if (pr >= 0 && pr < shape.length && pc >= 0 && pc < shape[0].length && shape[pr][pc]) {
            cellType = current.type
            isGhost = false
          }
        }

        cells.push(
          <div
            key={`${r}-${c}`}
            className={`cell ${cellType ?? ''} ${isGhost ? 'ghost' : ''}`}
          />
        )
      }
    }
    return cells
  }

  const renderNextPiece = () => {
    const nextShape = SHAPES[next.type][0]
    const cells: JSX.Element[] = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const filled = r < nextShape.length && c < nextShape[0].length && nextShape[r][c]
        cells.push(
          <div key={`${r}-${c}`} className={`next-cell ${filled ? next.type : ''}`} />
        )
      }
    }
    return cells
  }

  return (
    <div className="game-container">
      <div className="board-wrapper">
        <div className="board">{renderBoard()}</div>
        {!started && (
          <div className="overlay">
            <h2>TETRIS</h2>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}
        {gameOver && (
          <div className="overlay">
            <h2>GAME OVER</h2>
            <p>Score: {score}</p>
            <button onClick={startGame}>Play Again</button>
          </div>
        )}
      </div>
      <div className="sidebar">
        <div className="panel">
          <h3>Score</h3>
          <div className="value">{score}</div>
        </div>
        <div className="panel">
          <h3>Lines</h3>
          <div className="value">{lines}</div>
        </div>
        <div className="panel">
          <h3>Level</h3>
          <div className="value">{level}</div>
        </div>
        <div className="panel">
          <h3>Next</h3>
          <div className="next-piece">{renderNextPiece()}</div>
        </div>
        <div className="controls">
          <div><kbd>&larr;</kbd> <kbd>&rarr;</kbd> Move</div>
          <div><kbd>&darr;</kbd> Soft drop</div>
          <div><kbd>&uarr;</kbd> Rotate</div>
          <div><kbd>Space</kbd> Hard drop</div>
        </div>
      </div>
    </div>
  )
}

export default App
