'use client';
import Link from "next/link";
import RegistroGoogle from "./registrar/registroServicios/registroGoogle";
import RegistroForm from "./registrar/registroServicios/page";
import GithubButton from "@/Components/requester/botonRegistro/buttonGithub";
import DiscordButton from "@/Components/requester/botonRegistro/buttonDiscord";

export default function SignUp() {
  return (
    <section className="flex justify-center items-center min-h-screen bg-gradient-to-b from-white to-blue-50 animate-fadeInUp">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-blue-100 rounded-3xl shadow-xl p-10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary/80 to-primary/60 bg-clip-text text-transparent">
          Registrate <span className="sr-only">Servineo</span>
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Modo requester
        </p>

        <RegistroForm />

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="px-3 text-gray-400 text-sm">o continúa con</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <div className="flex flex-col items-center space-y-3 mt-3">
          <RegistroGoogle />
          <GithubButton />
          <DiscordButton />
        </div>

        <div className="flex items-start mt-5 text-sm text-gray-600">
          <input
            type="checkbox"
            className="mt-1 mr-2 accent-blue-500 focus:ring-2 focus:ring-blue-300 rounded"
          />
          <p>
            Al registrarte aceptas los{" "}
            <Link
              href="./RegistarFormDP/Terminosycondiciones/page"
              className="underline text-blue-500 hover:text-blue-400 transition"
            >
              términos de uso
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-gray-700 text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="../requester/signUp"
            className="text-blue-500 hover:text-blue-400 font-semibold hover:underline transition"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </section>
  );
}
