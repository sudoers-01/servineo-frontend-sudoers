'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cambiarContrasena } from './service/editPassword';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

type Props = {
  onCancel?: () => void;
  onSaved?: () => void;
};

export default function ChangePasswordForm({ onCancel, onSaved }: Props) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  function validarContrasena(password: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("servineo_token");
    if (!token) {
      setError('No hay sesión activa. Por favor, inicia sesión.');
      return;
    }

    // 🔹 Validaciones previas
    if (!currentPassword.trim()) return setError('Ingresa tu contraseña actual');
    if (!newPassword.trim()) return setError('Ingresa una nueva contraseña');
    if (!validarContrasena(newPassword))
      return setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número');
    if (!confirmPassword.trim()) return setError('Confirma tu nueva contraseña');
    if (newPassword !== confirmPassword) return setError('Las contraseñas no coinciden');
    if (currentPassword === newPassword) return setError('La nueva contraseña debe ser diferente a la actual');

    setLoading(true);

    try {
      const result = await cambiarContrasena({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (result.success) {
        setSuccess('Contraseña actualizada exitosamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Mostrar modal tras un pequeño delay
        setTimeout(() => setShowSuggestionModal(true), 2000);
      } else {
        // Error controlado desde backend
        setError(result.message || 'El cambio no se completó, error inesperado.');
      }
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);

      // 🔹 Clasificación del error
      if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
        setError('El cambio no se completó, error de conexión.');
      } else if (err.response?.status >= 500) {
        setError('El cambio no se completó, error del servidor.');
      } else if (err.name === 'TypeError' || err instanceof TypeError) {
        setError('El cambio no se completó, error inesperado de JS.');
      } else {
        setError('El cambio no se completó, error inesperado.');
      }
    } finally {
      setLoading(false);

      // 🔹 Desaparecer mensaje después de 10 segundos
      setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 10000);
    }
  }

  return (
    <div className="relative flex flex-col gap-6 rounded-lg border border-[#E5F4FB] bg-white p-6 shadow-sm transition-all duration-300">
      <p className="text-sm text-gray-400 mb-2">
        Elige una contraseña segura y no la utilices en otras cuentas.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Contraseña actual */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-semibold text-[#1A223F] mb-2">
            Contraseña actual
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setError(null); }}
              onPaste={(e) => e.preventDefault()}
              placeholder="Ingresa tu contraseña actual"
              className="w-full rounded-md border border-[#E5F4FB] bg-[#F5FAFE] px-3 py-2 text-[#1A223F] placeholder-gray-400 focus:border-[#2BDDE0] focus:outline-none focus:ring-1 focus:ring-[#2BDDE0]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Nueva contraseña */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-[#1A223F] mb-2">
            Contraseña nueva
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
              onPaste={(e) => e.preventDefault()}
              placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número"
              className="w-full rounded-md border border-[#E5F4FB] bg-[#F5FAFE] px-3 py-2 text-[#1A223F] placeholder-gray-400 focus:border-[#2BDDE0] focus:outline-none focus:ring-1 focus:ring-[#2BDDE0]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirmar nueva contraseña */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#1A223F] mb-2">
            Confirmar nueva contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              onPaste={(e) => e.preventDefault()}
              placeholder="Repita su nueva contraseña"
              className="w-full rounded-md border border-[#E5F4FB] bg-[#F5FAFE] px-3 py-2 text-[#1A223F] placeholder-gray-400 focus:border-[#2BDDE0] focus:outline-none focus:ring-1 focus:ring-[#2BDDE0]"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div
            className="rounded-md bg-red-50 p-3 text-sm text-red-700 transition-opacity duration-1000 ease-out"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="rounded-md bg-green-50 p-3 text-sm text-green-700 transition-opacity duration-1000 ease-out"
          >
            {success}
          </div>
        )}

        {/* Botones */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-[#1A223F] px-4 py-2 text-white font-semibold hover:bg-[#2B31E0] disabled:bg-[#759AE0]"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Guardando...
              </>
            ) : (
              'Cambiar contraseña'
            )}
          </button>
          <button
            type="button"
            onClick={() => (onCancel ? onCancel() : router.back())}
            disabled={loading}
            className="rounded-md bg-[#E5F4FB] px-4 py-2 text-[#1A223F] font-semibold hover:bg-[#2BDDE0]/20"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal de sugerencia solo si éxito */}
      {showSuggestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white w-[520px] rounded-lg shadow-lg overflow-hidden">
            <div
              className="text-center text-white font-semibold py-4 text-lg"
              style={{ background: 'linear-gradient(135deg, #2B31E0 0%, #1AA7ED 50%, #5E2BE0 100%)' }}
            >
              Sugerencia
            </div>
            <div className="p-6 text-center text-[#1A223F] text-base">
              Servineo te recomienda cerrar todas las sesiones activas de tus dispositivos.
            </div>
            <div className="flex justify-between px-6 pb-6 gap-6">
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-md bg-[#E5F4FB] px-4 py-2 text-[#1A223F] font-semibold hover:bg-[#2BDDE0]/20"
              >
                No, cerrar sesiones
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 rounded-md bg-[#1A223F] px-4 py-2 text-white font-semibold hover:bg-[#2B31E0]"
              >
                Sí, cerrar sesiones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
