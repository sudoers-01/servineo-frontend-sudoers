'use client';
import RegistroGoogle from "../components/registro/registroGoogle";

export default function SignUp() {
  return (
    <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-10 border border-servineo-100">
      <h1 className="text-3xl font-bold text-center text-servineo-500 mb-2">
        Iniciar sesión <span className="text-servineo-400">Servineo</span>
      </h1>
      <p className="text-center text-sm text-gray-500 mb-8">Modo requester</p>  
      <div className="flex items-center my-8">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="px-2 text-gray-400 text-sm">o</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      <RegistroGoogle />
      <p className="mt-8 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <a
          href="#"
          className="text-servineo-400 hover:text-servineo-500 font-medium hover:underline transition"
        >
          Regístrate
        </a>
      </p>
    </div>
  );
}
