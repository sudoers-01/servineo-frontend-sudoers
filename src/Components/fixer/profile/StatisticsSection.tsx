"use client"

import { Card } from "@/Components/Card"
import { Star, CheckCircle, Clock, ThumbsUp } from "lucide-react"

export function StatisticsSection() {
    const stats = [
        {
            label: "Trabajos Completados",
            value: "124",
            icon: CheckCircle,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            label: "Calificación Promedio",
            value: "4.8",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-100"
        },
        {
            label: "Tasa de Respuesta",
            value: "98%",
            icon: ThumbsUp,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            label: "Tiempo de Respuesta",
            value: "< 1h",
            icon: Clock,
            color: "text-purple-600",
            bg: "bg-purple-100"
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
                <Card key={index} className="flex items-center gap-4 p-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-full ${stat.bg}`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                </Card>
            ))}
        </div>
    )
}
