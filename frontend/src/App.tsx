import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CargarPartido from './pages/CargarPartido'
import HistorialPartidos from './pages/HistorialPartidos'
import Estadisticas from './pages/Estadisticas'
import VotarPartido from './pages/VotarPartido'
import DetallePartido from './pages/DetallePartido'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cargar-partido" element={<ProtectedRoute><CargarPartido /></ProtectedRoute>} />
        <Route path="/historial" element={<ProtectedRoute><HistorialPartidos /></ProtectedRoute>} />
        <Route path="/estadisticas" element={<ProtectedRoute><Estadisticas /></ProtectedRoute>} />
        <Route path="/votar/:id" element={<ProtectedRoute><VotarPartido /></ProtectedRoute>} />
        <Route path="/partido/:id" element={<ProtectedRoute><DetallePartido /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
