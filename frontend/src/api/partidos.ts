import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface Partido {
  id: number
  fecha: string
  rival: string | null
  goles_favor: number
  goles_contra: number
  resultado: string
  notas: string | null
}

export interface Participacion {
  id: number
  partido_id: number
  jugador_id: string
  goles: number
  asistencias: number
  promedio_puntaje: number
  votos_mvp: number
  es_mvp: boolean
  nombre: string
  apodo: string
}

export interface CreatePartidoData {
  fecha: string
  rival?: string
  golesFavor: number
  golesContra: number
  notas?: string
  participaciones: {
    jugadorId: number
    goles: number
    asistencias: number
  }[]
}

export const getPartidos = async (): Promise<Partido[]> => {
  const response = await axios.get(`${API_URL}/partidos`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const getPartidoById = async (id: number): Promise<Partido> => {
  const response = await axios.get(`${API_URL}/partidos/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const createPartido = async (data: CreatePartidoData): Promise<Partido> => {
  const response = await axios.post(`${API_URL}/partidos`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const getParticipaciones = async (partidoId: number): Promise<Participacion[]> => {
  const response = await axios.get(`${API_URL}/partidos/${partidoId}/participaciones`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const addPuntuaciones = async (partidoId: number, data: { jugador_que_puntua: number, puntuaciones: { jugador_puntuado: number, puntaje: number, voto_mvp: boolean }[] }): Promise<void> => {
  await axios.post(`${API_URL}/partidos/${partidoId}/puntuaciones`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
}
