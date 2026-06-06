import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPartidoById, getParticipaciones } from '../api/partidos'

export default function DetallePartido() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const partidoId = parseInt(id || '0')
  
  const [partido, setPartido] = useState<any>(null)
  const [participaciones, setParticipaciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partidoData, participacionesData] = await Promise.all([
          getPartidoById(partidoId),
          getParticipaciones(partidoId)
        ])
        setPartido(partidoData)
        setParticipaciones(participacionesData)
      } catch (err) {
        setError('Error al cargar datos del partido')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [partidoId])

  const getResultadoClass = (resultado: string) => {
    switch (resultado) {
      case 'victoria':
        return 'bg-green-100 text-green-800'
      case 'derrota':
        return 'bg-red-100 text-red-800'
      case 'empate':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getResultadoLabel = (resultado: string) => {
    switch (resultado) {
      case 'victoria':
        return 'Victoria'
      case 'derrota':
        return 'Derrota'
      case 'empate':
        return 'Empate'
      default:
        return resultado
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/historial')} className="text-white hover:text-green-200">
            ← Volver al Historial
          </button>
          <h1 className="text-2xl font-bold">Detalle del Partido</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Party Info */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Información del Partido</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 text-sm">Fecha</span>
                <p className="text-lg font-semibold">
                  {partido && new Date(partido.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Resultado</span>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getResultadoClass(partido?.resultado)}`}>
                    {getResultadoLabel(partido?.resultado)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Marcador</span>
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green-600">{partido?.goles_favor}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-3xl font-bold text-red-600">{partido?.goles_contra}</span>
                </div>
              </div>
              {partido?.rival && (
                <div>
                  <span className="text-gray-500 text-sm">Rival</span>
                  <p className="text-lg font-semibold">{partido.rival}</p>
                </div>
              )}
            </div>
          </div>

          {/* Player Stats */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-green-700">Estadísticas de Jugadores</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-600">Jugador</th>
                    <th className="text-center py-3 px-4 text-gray-600">Goles</th>
                    <th className="text-center py-3 px-4 text-gray-600">Asistencias</th>
                    <th className="text-center py-3 px-4 text-gray-600">Promedio</th>
                    <th className="text-center py-3 px-4 text-gray-600">MVP</th>
                  </tr>
                </thead>
                <tbody>
                  {participaciones.map((participacion) => (
                    <tr key={participacion.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold">{participacion.apodo}</div>
                        <div className="text-sm text-gray-500">{participacion.nombre}</div>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold">{participacion.goles}</td>
                      <td className="text-center py-3 px-4 font-semibold">{participacion.asistencias}</td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-green-600">
                          {participacion.promedio_puntaje > 0 ? parseFloat(participacion.promedio_puntaje || '0').toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {participacion.es_mvp && (
                          <span className="text-2xl">⭐</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
