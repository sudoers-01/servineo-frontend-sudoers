'use client'

import { useState } from 'react'
import RequesterEditForm from '../controlC/RequesterEditForm'

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      setLoggedIn(true)
    } else {
      alert('Ingrese usuario y contraseña')
    }
  }

  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      {!loggedIn && (
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
      )}

      {loggedIn && !showEditForm && (
        <div className="text-center">
          <p className="mb-3">Bienvenido, {username}!</p>
          <button
            onClick={() => setShowEditForm(true)}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Editar requester
          </button>
        </div>
      )}

      {loggedIn && showEditForm && (
        <div className="border p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-3">Editar requester</h2>
          <RequesterEditForm
            requesterId="abc12"
            initialPhone="+591 7xxxxxxx"
            initialLocation="Cochabamba"
            onSaved={() => alert('Cambios guardados!')}
          />
        </div>
      )}
    </main>
  )
}
