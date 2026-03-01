import { useReducer, useCallback, useEffect, useRef } from 'react'
import type { GameState, GameAction } from '../types'
import { POINTS } from '../constants'
import {
  createBoard,
  randomPiece,
  collides,
  lockPiece,
  clearLines,
  getGhostRow,
  spawnPiece,
  calculateLevel,
  calculateSpeed,
} from '../utils/gameLogic'

const INITIAL_STATE: GameState = {
  board: createBoard(),
  current: randomPiece(),
  next: randomPiece(),
  score: 0,
  lines: 0,
  level: 1,
  gameOver: false,
  started: false,
  isLocking: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const newBoard = createBoard()
      const newCurrent = randomPiece()
      const newNext = randomPiece()
      return {
        ...INITIAL_STATE,
        board: newBoard,
        current: newCurrent,
        next: newNext,
        started: true,
      }
    }

    case 'MOVE_DOWN': {
      if (!state.started || state.gameOver || state.isLocking) {
        return state
      }

      if (collides(state.board, state.current, 1, 0)) {
        // Lock the piece immediately when collision detected
        const lockedBoard = lockPiece(state.board, state.current)
        const { board: clearedBoard, linesCleared } = clearLines(lockedBoard)
        const newScore = state.score + POINTS[linesCleared]
        const newLines = state.lines + linesCleared
        const newLevel = calculateLevel(newLines)
        const spawnedPiece = spawnPiece(state.next)

        // Check if spawned piece collides (game over)
        if (collides(clearedBoard, spawnedPiece, 0, 0)) {
          return {
            ...state,
            board: clearedBoard,
            score: newScore,
            lines: newLines,
            level: newLevel,
            gameOver: true,
            isLocking: false,
          }
        }

        return {
          ...state,
          board: clearedBoard,
          current: spawnedPiece,
          next: randomPiece(),
          score: newScore,
          lines: newLines,
          level: newLevel,
          isLocking: false,
        }
      }

      return {
        ...state,
        current: { ...state.current, row: state.current.row + 1 },
      }
    }

    case 'MOVE': {
      if (!state.started || state.gameOver || state.isLocking) {
        return state
      }

      const colOff = action.payload
      if (!collides(state.board, state.current, 0, colOff)) {
        return {
          ...state,
          current: { ...state.current, col: state.current.col + colOff },
        }
      }
      return state
    }

    case 'ROTATE': {
      if (!state.started || state.gameOver || state.isLocking) {
        return state
      }

      const newRot = (state.current.rotation + 1) % 4
      // Try basic rotation, then wall kicks
      const kicks = [0, -1, 1, -2, 2]
      for (const kick of kicks) {
        if (!collides(state.board, state.current, 0, kick, newRot)) {
          return {
            ...state,
            current: {
              ...state.current,
              rotation: newRot,
              col: state.current.col + kick,
            },
          }
        }
      }
      return state
    }

    case 'HARD_DROP': {
      if (!state.started || state.gameOver || state.isLocking) {
        return state
      }

      const ghost = getGhostRow(state.board, state.current)
      const dropDistance = ghost - state.current.row
      const newScore = state.score + dropDistance * 2

      // Lock immediately at ghost position - no setTimeout race condition
      const lockedBoard = lockPiece(state.board, { ...state.current, row: ghost })
      const { board: clearedBoard, linesCleared } = clearLines(lockedBoard)
      const finalScore = newScore + POINTS[linesCleared]
      const newLines = state.lines + linesCleared
      const newLevel = calculateLevel(newLines)
      const spawnedPiece = spawnPiece(state.next)

      // Check if spawned piece collides (game over)
      if (collides(clearedBoard, spawnedPiece, 0, 0)) {
        return {
          ...state,
          board: clearedBoard,
          current: { ...state.current, row: ghost },
          score: finalScore,
          lines: newLines,
          level: newLevel,
          gameOver: true,
          isLocking: false,
        }
      }

      return {
        ...state,
        board: clearedBoard,
        current: spawnedPiece,
        next: randomPiece(),
        score: finalScore,
        lines: newLines,
        level: newLevel,
        isLocking: false,
      }
    }

    default:
      return state
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE)
  
  // Use ref to track dispatch in interval without re-creating it
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' })
  }, [])

  const moveDown = useCallback(() => {
    dispatch({ type: 'MOVE_DOWN' })
  }, [])

  const move = useCallback((colOff: number) => {
    dispatch({ type: 'MOVE', payload: colOff })
  }, [])

  const rotate = useCallback(() => {
    dispatch({ type: 'ROTATE' })
  }, [])

  const hardDrop = useCallback(() => {
    dispatch({ type: 'HARD_DROP' })
  }, [])

  // Game loop with stable interval reference
  useEffect(() => {
    if (!state.started || state.gameOver) return

    const speed = calculateSpeed(state.level)
    const id = setInterval(() => {
      dispatchRef.current({ type: 'MOVE_DOWN' })
    }, speed)

    return () => clearInterval(id)
  }, [state.started, state.gameOver, state.level])

  // Keyboard controls
  useEffect(() => {
    if (!state.started || state.gameOver) return

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          dispatch({ type: 'MOVE', payload: -1 })
          break
        case 'ArrowRight':
          e.preventDefault()
          dispatch({ type: 'MOVE', payload: 1 })
          break
        case 'ArrowDown':
          e.preventDefault()
          dispatch({ type: 'MOVE_DOWN' })
          break
        case 'ArrowUp':
          e.preventDefault()
          dispatch({ type: 'ROTATE' })
          break
        case ' ':
          e.preventDefault()
          dispatch({ type: 'HARD_DROP' })
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.started, state.gameOver])

  return {
    state,
    actions: {
      startGame,
      moveDown,
      move,
      rotate,
      hardDrop,
    },
  }
}
