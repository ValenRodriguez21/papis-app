import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const axiosInstance = axios.create({
  baseURL: API_URL
})

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redirect to login
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
