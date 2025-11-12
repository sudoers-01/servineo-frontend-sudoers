"use client";

import { FaDiscord } from "react-icons/fa";

export default function DiscordButton() {
  const handleClick = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_DISCORD_START || "";
    window.location.href = baseUrl;
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 bg-[#5865F2] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#4752C4] transition-colors shadow-sm justify-center border border-transparent"
      >
        <FaDiscord size={20} />
        Continuar con Discord
      </button>
    </div>
  );
}



