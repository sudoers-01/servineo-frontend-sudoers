"use client"

import { useEffect } from "react"
import { useAppDispatch } from "./hooks"
import { setUser } from "./slice/userSlice"

export function AuthInitializer() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const storedUser = localStorage.getItem("servineo_user")
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser)
                dispatch(setUser(user))
            } catch (error) {
                console.error("Error parsing stored user:", error)
                localStorage.removeItem("servineo_user")
            }
        }
    }, [dispatch])

    return null
}
