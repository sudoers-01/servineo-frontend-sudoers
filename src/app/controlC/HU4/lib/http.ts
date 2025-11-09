// src/app/controlC/HU4/lib/http.ts
import axios from "axios";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("servineo_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
