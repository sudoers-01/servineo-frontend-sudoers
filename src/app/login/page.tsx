'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      // opcional: almacenar usuario en localStorage/contexto para usarlo en profile
      router.push('/home/profile')
    } else {
      alert('Ingrese usuario y contraseña')
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <form onSubmit={handleLogin} className="space-y-3 border p-4 rounded shadow">
        <h2 className="text-xl font-semibold">Login</h2>
        <div>
          <label className="block text-sm font-medium">Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          Login
        </button>
      </form>
    </main>
  )
}
