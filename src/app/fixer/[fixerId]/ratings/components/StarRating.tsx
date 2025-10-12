'use client'

type Props = { value: 1 | 2 | 3; size?: number; srLabel?: string }

export default function StarRating({ value, size = 18, srLabel }: Props) {
  return (
    <div className="inline-flex gap-1" aria-label={srLabel ?? `${value} de 3 estrellas`}>
      {Array.from({ length: 3 }).map((_, i) => {
        const filled = i < value
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            role="img"
            aria-hidden="true"
            className={filled ? 'fill-highlight' : 'fill-transparent stroke-highlight'}
          >
            <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        )
      })}
    </div>
  )
}
