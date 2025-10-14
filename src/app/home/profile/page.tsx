'use client'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  // Opcional: recuperar el username de alguna fuente (localStorage, contexto, etc.)
  const username = 'Usuario'

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <div className="text-center">
        <p className="mb-3">Bienvenido, {username}!</p>
        <button
          onClick={() => router.push('/home/profile/editProfile')}
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Editar requester
        </button>
      </div>
    </main>
  )
}
