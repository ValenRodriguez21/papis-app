import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    jugadorId: number
  }
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials)
  return response.data
}

export const logout = async (): Promise<void> => {
  await axios.post(`${API_URL}/auth/logout`)
}

export const verifyToken = async (token: string): Promise<AuthResponse> => {
  const response = await axios.get(`${API_URL}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}
