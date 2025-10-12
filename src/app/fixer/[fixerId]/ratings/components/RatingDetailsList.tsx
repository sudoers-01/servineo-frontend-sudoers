'use client'
import { useState, useEffect } from 'react'
import type { FixerRating } from '@/mocks/ratings'
import StarRating from './StarRating'

type Props = { ratings: FixerRating[]; error?: string }

export default function RatingDetailsList({ ratings, error }: Props) {
  const [expandedCommentId, setExpandedCommentId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si es móvil o escritorio
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    window.addEventListener('resize', handleResize)
    handleResize()  // para configurar inicialmente
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Detectar si el comentario es largo según pantalla
  const commentLengthLimit = isMobile ? 100 : 200 // Ajusta para móvil o desktop

  const toggleComment = (id: string) => {
    if (expandedCommentId === id) {
      setExpandedCommentId(null)
    } else {
      setExpandedCommentId(id)
    }
  }

  if (error) {
    return (
      <div className="p-4 border border-error rounded-lg bg-error/10 text-error text-sm">
        ⚠️ Ocurrió un problema al cargar las calificaciones. Inténtalo nuevamente.
      </div>
    )
  }

  if (!ratings?.length) {
    return (
      <div className="p-6 text-sm text-text-muted border rounded-lg bg-surface-card">
        Este FIXER no tiene calificaciones registradas.
      </div>
    )
  }

  const ordered = [...ratings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <ul className="flex flex-col gap-4">
      {ordered.map(r => {
        const isLongComment = r.comment && r.comment.length > commentLengthLimit

        return (
          <li
            key={r.id}
            className="flex items-start gap-4 p-4 rounded-xl border border-surface-border bg-surface-card hover:shadow-sm transition-shadow"
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              <span className="text-xs">👤</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium truncate">{r.requester}</p>
                <StarRating value={r.score} />
              </div>
              <p className="text-xs text-text-muted">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>

              {/* Mostrar comentario truncado o expandido */}
              <p
                className={`text-sm mt-1 leading-6 text-foreground/80 ${expandedCommentId === r.id ? '' : 'line-clamp-2'}`}
              >
                {r.comment}
              </p>

              {/* Botón "Ver más" solo si el comentario es largo */}
              {isLongComment && (
                <button
                  className="text-primary mt-2 text-xs sm:hidden"
                  onClick={() => toggleComment(r.id)}
                  aria-expanded={expandedCommentId === r.id}
                >
                  {expandedCommentId === r.id ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
