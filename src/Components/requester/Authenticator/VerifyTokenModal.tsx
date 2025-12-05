'use client';
import React, { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onVerify: (token: string) => Promise<void> | void;
  loading?: boolean;
}

export default function VerifyTokenModal({ open, onClose, onVerify, loading }: Props) {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // NUEVO: intentos restantes y mensaje de bloqueo
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockedInfo, setLockedInfo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCode('');
      setErrorMsg(null);
      setShake(false);
      setAttemptsLeft(null);
      setLockedInfo(null);
    } else {
      setCode('');
      setErrorMsg(null);
      setShake(false);
      setAttemptsLeft(null);
      setLockedInfo(null);
    }
  }, [open]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setCode(onlyDigits.slice(0, 6));
    if (errorMsg) setErrorMsg(null);
    if (attemptsLeft !== null) setAttemptsLeft(null);
    if (lockedInfo) setLockedInfo(null);
  };

  // helper: segundos restantes desde ISO string
  function secondsUntil(iso?: string | null) {
    if (!iso) return null;
    const diff = Math.ceil((new Date(iso).getTime() - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg('El código debe tener exactamente 6 dígitos.');
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    try {
      // onVerify debe llamar a verifyToken (fetch) y lanzar errores enriquecidos
      await onVerify(code.trim());
    } catch (err: any) {
      // Limpio estados anteriores
      setAttemptsLeft(null);
      setLockedInfo(null);

      // Mensaje por defecto
      let msg = 'Código incorrecto o expirado. Intenta nuevamente.';

      // === Aquí adaptamos al shape de errors que genera fetchWithAuth / verifyToken ===
      // Posibles formas que podemos recibir:
      // 1) err.locked === true, err.lockedUntil (ISO), err.retryAfterSeconds
      // 2) err.attemptsLeft (number), err.attempts (number)
      // 3) err.status and err.data (por si tu helper incluyó ambos)
      // 4) err.message (fallback)

      // LOCKED (423 en backend -> err.locked true)
      if (err?.locked) {
        const retrySeconds = err?.retryAfterSeconds ?? secondsUntil(err?.lockedUntil ?? null);
        const minutes = retrySeconds ? Math.ceil(retrySeconds / 60) : null;

        msg = err?.message || 'Tu cuenta está temporalmente bloqueada por demasiados intentos.';
        setLockedInfo(
          minutes
            ? `Podrás volver a intentar en aproximadamente ${minutes} minuto(s).`
            : retrySeconds
            ? `Podrás volver a intentar en aproximadamente ${retrySeconds} segundos.`
            : null
        );
      }
      // TOKEN INVÁLIDO (pero no bloqueado): attemptsLeft presente
      else if (typeof err?.attemptsLeft === 'number') {
        msg = err?.message || 'Token inválido.';
        setAttemptsLeft(err.attemptsLeft);
      }
      // Posible compatibilidad: err.status + err.data (si tu fetchWithAuth dejó data)
      else if (typeof err?.status === 'number' && err?.data) {
        const status = err.status;
        const data = err.data;
        if (status === 423) {
          const retrySeconds = data?.retryAfterSeconds ?? secondsUntil(data?.lockedUntil ?? null);
          const minutes = retrySeconds ? Math.ceil(retrySeconds / 60) : null;
          msg = data?.message || 'Tu cuenta está temporalmente bloqueada.';
          setLockedInfo(
            minutes
              ? `Podrás volver a intentar en aproximadamente ${minutes} minuto(s).`
              : retrySeconds
              ? `Podrás volver a intentar en aproximadamente ${retrySeconds} segundos.`
              : null
          );
        } else if (status === 400 && typeof data?.attemptsLeft === 'number') {
          msg = data?.message || 'Token inválido.';
          setAttemptsLeft(data.attemptsLeft);
        } else {
          msg = data?.message || err?.message || msg;
        }
      }
      // Fallback: usar err.message si existe
      else if (err?.message) {
        msg = err.message;
      }

      setErrorMsg(msg);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className={`bg-white rounded-lg w-[420px] p-6 shadow-lg border transition-all duration-300 ${
          shake ? 'animate-shake border-red-400' : ''
        }`}
      >
        <h3 className="text-lg font-semibold mb-2">
          Ingresa el código de autenticador
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Introduce los 6 dígitos que muestra tu app de autenticación.
        </p>

        <input
          autoFocus
          inputMode="numeric"
          pattern="[0-9]*"
          value={code}
          onChange={handleChange}
          className={`w-full p-2 border rounded mb-2 font-mono text-lg text-center tracking-widest transition-all ${
            errorMsg ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="••••••"
        />

        {errorMsg && (
          <div className="text-red-600 text-sm mb-1 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* NUEVO: intentos restantes */}
        {attemptsLeft !== null && attemptsLeft >= 0 && (
          <div className="text-xs text-center text-red-500 mb-1">
            Intentos restantes: <span className="font-semibold">{attemptsLeft}</span>
          </div>
        )}

        {/* NUEVO: info de bloqueo */}
        {lockedInfo && (
          <div className="text-xs text-center text-red-500 mb-2">
            {lockedInfo}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={() => {
              setCode('');
              setErrorMsg(null);
              setAttemptsLeft(null);
              setLockedInfo(null);
              onClose();
            }}
            className="px-3 py-2 rounded border text-sm bg-white text-gray-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded text-sm bg-indigo-600 text-white"
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
          75% {
            transform: translateX(-4px);
          }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}