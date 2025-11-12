"use client";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { vincularCorreoContrasena } from "../../../redux/services/services/api";

interface VincularCorreoProps {
  token: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onLinked?: (client: any) => void;
}

export default function VincularCorreo({ token, onLinked }: VincularCorreoProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVincular = async () => {
    if (!email || !password) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }

    setLoading(true);
    const result = await vincularCorreoContrasena(token, email, password);
    setSuccess(result.success);

    if (result.success) {
      toast.success(result.message);
      onLinked?.(result.client);
      setMostrarFormulario(false);
      setEmail("");
      setPassword("");
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm hover:bg-gray-50 transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 align-middle">

          <Mail size={28} className="text-gray-800" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">Correo y contraseña</span>
            <span className="text-xs text-gray-500">Vincula tu cuenta con credenciales</span>
          </div>
        </div>

        <button
          onClick={() => setMostrarFormulario((prev) => !prev)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
        >
          {mostrarFormulario ? "Cancelar" : "Vincular"}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mb-2 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full mb-3 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={handleVincular}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Vinculando..." : "Confirmar Vinculación"}
          </button>

          {success && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              Vinculación exitosa.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
