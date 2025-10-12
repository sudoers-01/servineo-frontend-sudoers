import { mockRatings } from '@/mocks/ratings'
import RatingDetailsList from './components/RatingDetailsList'

export default function RatingsPage() {
  const simulateError = false // cambia a true para probar el mensaje
  const errorMsg = simulateError ? 'failed' : undefined

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Rating Details
        </h1>
        <a href=".." className="text-sm px-3 py-1.5 border border-surface-border rounded-lg hover:bg-white/60 transition-colors" aria-label="Volver al perfil">
          Back
        </a>
      </header>

      <RatingDetailsList ratings={mockRatings} error={errorMsg} />
    </main>
  )
}
