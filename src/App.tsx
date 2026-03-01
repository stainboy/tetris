import { useMemo } from 'react'
import { useGame } from './hooks/useGame'
import { Cell } from './components/Cell'
import { getShape, getGhostRow } from './utils/gameLogic'
import { SHAPES, ROWS, COLS } from './constants'
// Types imported via hooks and components
import './App.css'

function App() {
  const { state, actions } = useGame()

  // Calculate ghost position for rendering
  const ghostPiece = useMemo(() => {
    if (!state.started) return null
    const ghostRow = getGhostRow(state.board, state.current)
    return { ...state.current, row: ghostRow }
  }, [state.board, state.current, state.started])

  // Render the board with current piece and ghost overlaid
  const renderBoard = () => {
    const cells: JSX.Element[] = []
    const currentShape = getShape(state.current)
    const ghostShape = ghostPiece ? getShape(ghostPiece) : null

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let cellType = state.board[r][c]
        let isGhost = false

        // Ghost piece
        if (!cellType && state.started && ghostPiece && ghostShape) {
          const gr = r - ghostPiece.row
          const gc = c - ghostPiece.col
          if (
            gr >= 0 &&
            gr < ghostShape.length &&
            gc >= 0 &&
            gc < ghostShape[0].length &&
            ghostShape[gr][gc]
          ) {
            cellType = ghostPiece.type
            isGhost = true
          }
        }

        // Current piece (overwrites ghost)
        if (state.started) {
          const pr = r - state.current.row
          const pc = c - state.current.col
          if (
            pr >= 0 &&
            pr < currentShape.length &&
            pc >= 0 &&
            pc < currentShape[0].length &&
            currentShape[pr][pc]
          ) {
            cellType = state.current.type
            isGhost = false
          }
        }

        cells.push(
          <Cell key={`${r}-${c}`} cellType={cellType} isGhost={isGhost} />
        )
      }
    }
    return cells
  }

  const renderNextPiece = () => {
    const nextShape = SHAPES[state.next.type][0]
    const cells: JSX.Element[] = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const filled =
          r < nextShape.length && c < nextShape[0].length && nextShape[r][c]
        cells.push(
          <div
            key={`${r}-${c}`}
            className={`next-cell ${filled ? state.next.type : ''}`}
          />
        )
      }
    }
    return cells
  }

  return (
    <div className="game-container">
      <div className="board-wrapper">
        <div className="board">{renderBoard()}</div>
        {!state.started && (
          <div className="overlay">
            <h2>TETRIS</h2>
            <button onClick={actions.startGame}>Start Game</button>
          </div>
        )}
        {state.gameOver && (
          <div className="overlay">
            <h2>GAME OVER</h2>
            <p>Score: {state.score}</p>
            <button onClick={actions.startGame}>Play Again</button>
          </div>
        )}
      </div>
      <div className="sidebar">
        <div className="panel">
          <h3>Score</h3>
          <div className="value">{state.score}</div>
        </div>
        <div className="panel">
          <h3>Lines</h3>
          <div className="value">{state.lines}</div>
        </div>
        <div className="panel">
          <h3>Level</h3>
          <div className="value">{state.level}</div>
        </div>
        <div className="panel">
          <h3>Next</h3>
          <div className="next-piece">{renderNextPiece()}</div>
        </div>
        <div className="controls">
          <div>
            <kbd>←</kbd> <kbd>→</kbd> Move
          </div>
          <div>
            <kbd>↓</kbd> Soft drop
          </div>
          <div>
            <kbd>↑</kbd> Rotate
          </div>
          <div>
            <kbd>Space</kbd> Hard drop
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
