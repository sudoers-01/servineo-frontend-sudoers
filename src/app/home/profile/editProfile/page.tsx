'use client'
import RequesterEditForm from '../../../../controlC/components/RequesterEditForm'

export default function EditProfilePage() {
  return (
    <main className="p-8 max-w-md mx-auto space-y-6">
      <RequesterEditForm
       requesterId="68f0545c12a9f3002a9d3c22"
       initialPhone="+59171234567"
       initialDirection="Cochabamba, BoliviaB"
       initialCoordinates={[-17.38195, -66.15995]}
       onSaved={() => alert('¡Cambios guardados!')}
       />
    </main>
  )
}
