'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cambiarContrasena } from './service/editPassword';
import { cerrarTodasSesiones } from './service/logoutService';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { obtenerUltimoCambio } from './service/getLastChange';

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
  const [ultimaModificacion, setUltimaModificacion] = useState<string>('');
  const [cargandoFecha, setCargandoFecha] = useState(true);

  useEffect(() => {
    const cargarUltimoCambio = async () => {
      try {
        setCargandoFecha(true);
        const resultado = await obtenerUltimoCambio();
        setUltimaModificacion(resultado.fechaFormateada);
      } catch (error) {
        console.error('Error al cargar último cambio:', error);
        setUltimaModificacion('No disponible');
      } finally {
        setCargandoFecha(false);
      }
    };

    cargarUltimoCambio();
  }, []);

  const actualizarFecha = async () => {
    try {
      const resultado = await obtenerUltimoCambio();
      setUltimaModificacion(resultado.fechaFormateada);
    } catch (error) {
      console.error('Error al actualizar fecha:', error);
    }
  };

  function limpiarCampos() {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }

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
    limpiarCampos();
    return;
  }

  // Validaciones existentes...
  if (!currentPassword.trim()) {
    setError('Ingresa tu contraseña actual');
    limpiarCampos();
    return;
  }
  if (!newPassword.trim()) {
    setError('Ingresa una nueva contraseña');
    limpiarCampos();
    return;
  }
  if (!confirmPassword.trim()) {
    setError('Confirma tu nueva contraseña');
    limpiarCampos();
    return;
  }
  if (/\s/.test(newPassword) || /\s/.test(confirmPassword)) {
    setError('La nueva contraseña no puede contener espacios');
    limpiarCampos();
    return;
  }
  if (!validarContrasena(newPassword)) {
    setError('La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número');
    limpiarCampos();
    return;
  }
  if (newPassword !== confirmPassword) {
    setError('Las contraseñas no coinciden');
    limpiarCampos();
    return;
  }
  if (currentPassword === newPassword) {
    setError('La nueva contraseña debe ser diferente a la actual');
    limpiarCampos();
    return;
  }

  setLoading(true);

  try {
    const result = await cambiarContrasena({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    // ✅ ÉXITO
    if (result.success) {
      setSuccess('Contraseña actualizada exitosamente');
      limpiarCampos();
      await actualizarFecha();
      setTimeout(() => setShowSuggestionModal(true), 2000);
    } else {
      // 🚨 ERROR (puede incluir contador de intentos o bloqueo)
      setError(result.message || 'El cambio no se completó, error inesperado.');
      
      // Solo limpiar contraseña actual en caso de error
      setCurrentPassword('');
      
      // Si es logout forzado, el servicio ya manejó la redirección
      if (result.forceLogout) {
        return; // No hacer nada más
      }
    }
  } catch (err: any) {
    console.error('Error al cambiar contraseña:', err);
    
    // Solo limpiar contraseña actual
    setCurrentPassword('');
    
    if (err.message?.includes('NetworkError') || err.message?.includes('Failed to fetch')) {
      setError('El cambio no se completó, error de conexión.');
    } else if (err.response?.status >= 500) {
      setError('El cambio no se completó, error del servidor.');
    } else {
      setError(err.message || 'El cambio no se completó, error inesperado.');
    }
  } finally {
    setLoading(false);
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
  <div className={`rounded-md p-3 text-sm transition-opacity duration-1000 ease-out ${
    error.includes('bloqueada') || error.includes('Demasiados intentos') || error.includes('restantes')
      ? 'bg-red-100 border border-red-300 text-red-800' 
      : 'bg-red-50 text-red-700'
  }`}>
    {(error.includes('bloqueada') || error.includes('Demasiados intentos')) && (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🔒</span>
        <strong>Seguridad Activada</strong>
      </div>
    )}
    {error.includes('restantes') && (
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">⚠️</span>
        <strong>Atención</strong>
      </div>
    )}
    {error}
  </div>
)}

{success && (
  <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 transition-opacity duration-1000 ease-out flex items-center gap-2">
    <span className="text-lg">✅</span>
    {success}
  </div>
)}
        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Última modificación:
            </span>
            {cargandoFecha ? (
              <div className="flex items-center gap-1">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm text-gray-500">Cargando...</span>
              </div>
            ) : (
              <span className="text-sm text-gray-600">{ultimaModificacion}</span>
            )}
          </div>
        </div>

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

      {/* Modal de sugerencia */}
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
                onClick={async () => {
                  try {
                    const result = await cerrarTodasSesiones();
                    console.log("✅ Resultado:", result.message);
                    localStorage.removeItem("servineo_token");
                    localStorage.removeItem("servineo_user");
                    window.location.href = "/";
                  } catch (error) {
                    console.error("❌ Error al cerrar sesiones:", error);
                    alert("No se pudo cerrar todas las sesiones. Intenta nuevamente.");
                  }
                }}
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