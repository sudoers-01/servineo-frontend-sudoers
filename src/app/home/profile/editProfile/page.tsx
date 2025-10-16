'use client'
import RequesterEditForm from '../../../../controlC/components/RequesterEditForm'

export default function EditProfilePage() {
  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <RequesterEditForm
      requesterId="68f0545c12a9f3002a9d3c22" // <-- usa el _id real
      initialPhone="+591 71234567"
      initialLocation="Cochabamba, Bolivia"
      onSaved={() => alert('¡Cambios guardados!')}
      onCancel={() => alert('Edición cancelada')}
   />
    </main>
  )
}
