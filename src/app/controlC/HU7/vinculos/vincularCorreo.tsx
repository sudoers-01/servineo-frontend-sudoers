"use client";
import { useState } from "react";

export default function VincularCorreo({ token, onLinked }: { token: string; onLinked?: (client: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVincular = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cliente/link-email-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al vincular método");

      setMessage("✅ Método vinculado correctamente");

      // Actualizar UI con el cliente completo
      if (onLinked) onLinked(data.client);
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-gray-50 mt-4 text-black">
      <h3 className="font-semibold mb-2">Vincular con correo y contraseña</h3>
      <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2 w-full mb-2 text-black" />
      <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="border rounded px-3 py-2 w-full mb-3 text-black" />
      <button disabled={loading} onClick={handleVincular} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
        {loading ? "Vinculando..." : "Vincular"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
