import { useState, type ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import clsx from 'clsx'

interface FlipCardProps {
  front: ReactNode
  back: ReactNode
  className?: string
  height?: string
}

export function FlipCard({ front, back, className, height = 'h-52' }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className={clsx('perspective', height, className)}>
      <div className={clsx('flip-inner relative h-full w-full', flipped && 'is-flipped')}>
        <div className="flip-face absolute inset-0 card flex flex-col overflow-hidden p-5">
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-brand-50 hover:text-brand-600"
            aria-label="Flip card"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {front}
        </div>
        <div className="flip-face flip-face-back absolute inset-0 card flex flex-col overflow-hidden bg-brand-600 p-5 text-white">
          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Flip back"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {back}
        </div>
      </div>
    </div>
  )
}
