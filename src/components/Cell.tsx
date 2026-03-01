import { memo } from 'react'
import type { PieceType } from '../types'

interface CellProps {
  cellType: PieceType | null
  isGhost?: boolean
}

/**
 * Optimized Cell component using React.memo to prevent unnecessary re-renders.
 * Only re-renders when cellType or isGhost changes.
 */
export const Cell = memo(function Cell({ cellType, isGhost = false }: CellProps) {
  return (
    <div
      className={`cell ${cellType ?? ''} ${isGhost ? 'ghost' : ''}`}
    />
  )
})

export default Cell
