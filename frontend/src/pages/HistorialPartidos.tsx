import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPartidos, Partido } from '../api/partidos'
import { getVotacionesPendientes } from '../api/jugadores'

export default function HistorialPartidos() {
  const navigate = useNavigate()
  const [partidos, setPartidos] = useState<Partido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votacionesPendientes, setVotacionesPendientes] = useState<any[]>([])

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partidosData, pendientes] = await Promise.all([
          getPartidos(),
          user.jugadorId ? getVotacionesPendientes(user.jugadorId) : Promise.resolve([])
        ])
        setPartidos(partidosData)
        setVotacionesPendientes(pendientes)
      } catch (err) {
        setError('Error al cargar partidos')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const tieneVotacionPendiente = (partidoId: number) => {
    return votacionesPendientes.some(p => p.id === partidoId)
  }

  const handlePartidoClick = (partidoId: number) => {
    if (tieneVotacionPendiente(partidoId)) {
      navigate(`/votar/${partidoId}`)
    } else {
      navigate(`/partido/${partidoId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-green-200">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Historial de Partidos</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        {loading && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Cargando partidos...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-500">
            <p className="text-xl">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-4xl mx-auto">
          {partidos.map((partido) => (
            <div
              key={partido.id}
              onClick={() => handlePartidoClick(partido.id)}
              className="bg-white p-6 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-gray-500 text-sm">
                      {new Date(partido.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getResultadoClass(partido.resultado)}`}>
                      {getResultadoLabel(partido.resultado)}
                    </span>
                    {tieneVotacionPendiente(partido.id) && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800">
                        Pendiente
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl font-bold text-green-600">{partido.goles_favor}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-3xl font-bold text-red-600">{partido.goles_contra}</span>
                    {partido.rival && (
                      <span className="text-gray-600 ml-4">vs {partido.rival}</span>
                    )}
                  </div>
                </div>
                
                {tieneVotacionPendiente(partido.id) ? (
                  <button className="text-orange-600 hover:text-orange-800">
                    Votar →
                  </button>
                ) : (
                  <button className="text-green-600 hover:text-green-800">
                    Ver detalle →
                  </button>
                )}
              </div>
            </div>
          ))}

          {partidos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-xl">No hay partidos registrados aún</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
