export type FixerRating = {
  id: string
  requester: string
  avatarUrl?: string
  score: 1 | 2 | 3 | 4 | 5
  comment?: string
  createdAt: string
}

export const mockRatings: FixerRating[] = [
  { id:'r1', requester:'Pedro Silvestre', score: 4, comment:'Buen trabajo y puntual. Lo recomiendo, su trabajo es limpio, rapido y muy recomendable. Da un trato profesional y respetuoso.',
    createdAt:'2025-10-07T13:20:00Z' },
  { id:'r2', requester:'Jesús Mamani',   score: 5, comment:'Excelente acabado.',
    createdAt:'2025-10-05T09:10:00Z' },
  { id:'r3', requester:'Silvia Cano',     score: 3, comment:'Cumplió pero tardó un poco.',
    createdAt:'2025-10-03T18:45:00Z' },
  { id:'r4', requester:'Álvaro Coca',     score: 2, comment:'Podría mejorar la limpieza.',
    createdAt:'2025-09-29T11:00:00Z' },
]
