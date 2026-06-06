import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getEstadisticas } from '../api/estadisticas'

interface EstadisticasJugador {
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
  porcentajeVictorias: string | number
}

export default function Estadisticas() {
  const navigate = useNavigate()
  const [estadisticas, setEstadisticas] = useState<EstadisticasJugador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEstadisticas = async () => {
      try {
        const data = await getEstadisticas()
        setEstadisticas(data)
      } catch (err) {
        setError('Error al cargar estadísticas')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchEstadisticas()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-green-200">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Estadísticas</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        {loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Cargando estadísticas...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            <p className="text-xl">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-6xl mx-auto overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Jugador</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">PJ</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Goles</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Asist</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">MVPs</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Prom</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">V</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">D</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">E</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">% V</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {estadisticas.map((jugador) => (
                <tr key={jugador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{jugador.apodo}</div>
                    <div className="text-sm text-gray-500">{jugador.nombre}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">{jugador.partidosJugados}</td>
                  <td className="px-6 py-4 text-center font-semibold text-green-600">{jugador.goles}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600">{jugador.asistencias}</td>
                  <td className="px-6 py-4 text-center font-semibold text-yellow-600">⭐ {jugador.mvps}</td>
                  <td className="px-6 py-4 text-center font-semibold">{jugador.promedioPuntaje.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center text-green-600 font-semibold">{jugador.victorias}</td>
                  <td className="px-6 py-4 text-center text-red-600 font-semibold">{jugador.derrotas}</td>
                  <td className="px-6 py-4 text-center text-yellow-600 font-semibold">{jugador.empates}</td>
                  <td className="px-6 py-4 text-center font-semibold">{parseFloat(String(jugador.porcentajeVictorias)).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="mt-8 max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Leyenda</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">PJ: Partidos Jugados</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">Prom: Promedio de Puntaje</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">V: Victorias</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">D: Derrotas</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">E: Empates</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-600">% V: Porcentaje de Victorias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
