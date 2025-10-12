"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Button from "../UI/button"
import ModalLayout from "./modalLayout"
import ContenedorRegistro from "../registro/contenedorRegistro"

export default function RegistroModal() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
      document.body.style.overflow = open ? "hidden" : ""
      return () => { document.body.style.overflow = "" }
  }, [open])

  if (!mounted) return null

  return (
    <>
      <Button onClick={() => setOpen(true)}>Registrarse</Button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>

              <ModalLayout>
                <ContenedorRegistro onSuccessClose={() => setOpen(false)} />
              </ModalLayout>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
