import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface EstadisticasJugador {
  id: number
  nombre: string
  apodo: string
  partidosJugados: number
  goles: number
  asistencias: number
  mvps: number
  promedioPuntaje: number
  victorias: number
  derrotas: number
  empates: number
  porcentajeVictorias: number
}

export const getEstadisticas = async (): Promise<EstadisticasJugador[]> => {
  const response = await axios.get(`${API_URL}/estadisticas`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const getEstadisticasJugador = async (jugadorId: number): Promise<EstadisticasJugador> => {
  const response = await axios.get(`${API_URL}/estadisticas/jugador/${jugadorId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}
