'use client'
import RequesterEditForm from '../../../../controlC/components/RequesterEditForm'

export default function EditProfilePage() {
  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-3">Editar requester</h2>
        <RequesterEditForm
          requesterId="abc12"
          initialPhone="+591 7xxxxxxx"
          initialLocation="Cochabamba"
          onSaved={() => alert('Cambios guardados!')}
        />
      </div>
    </main>
  )
}
