import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface Jugador {
  id: number
  nombre: string
  apodo: string
  activo: boolean
}

export const getJugadores = async (): Promise<Jugador[]> => {
  const response = await axios.get(`${API_URL}/jugadores`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const getJugadorById = async (id: number): Promise<Jugador> => {
  const response = await axios.get(`${API_URL}/jugadores/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}

export const getVotacionesPendientes = async (jugadorId: number): Promise<any[]> => {
  const response = await axios.get(`${API_URL}/jugadores/${jugadorId}/votaciones-pendientes`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  })
  return response.data
}
