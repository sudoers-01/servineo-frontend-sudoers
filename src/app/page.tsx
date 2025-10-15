'use client'

import { useState } from 'react'
import Layout from '../controlC/components/layout' // AJUSTA la ruta si tu layout está en otro lugar
// import RequesterEditForm from '../controlC/components/RequesterEditForm' <-- NO lo importamos aquí

export default function Home() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setLoggedIn(true)
    } else {
      alert('Ingrese usuario y contraseña')
    }
  }

  // Si no está logueado, mostramos el formulario de login (igual que antes)
  if (!loggedIn) {
    return (
      <main className="p-5 max-w-xl mx-auto space-y-6">
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

  // Si ya está logueado, mostramos EL layout (que contiene navbar y abrirá el RequesterEditForm)
  return (
    // Pasamos el username como children o prop según cómo tengas implementado tu layout.
    // Aquí renderizamos el Layout y le pasamos un contenido simple.
    <Layout>
      <div className="text-center mt-6">
        <p className="mb-3">Bienvenido, {username}!</p>
      </div>
    </Layout>
  )
}
