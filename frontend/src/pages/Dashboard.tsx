import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPartidos } from '../api/partidos'
import { getEstadisticas } from '../api/estadisticas'
import { getVotacionesPendientes } from '../api/jugadores'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [ultimoPartido, setUltimoPartido] = useState<any>(null)
  const [topGoleador, setTopGoleador] = useState<any>(null)
  const [mvpHistorico, setMvpHistorico] = useState<any>(null)
  const [votacionesPendientes, setVotacionesPendientes] = useState<any[]>([])

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partidos, estadisticas] = await Promise.all([
          getPartidos(),
          getEstadisticas()
        ])

        // Get last match
        if (partidos.length > 0) {
          setUltimoPartido(partidos[0])
        }

        // Get top scorer
        if (estadisticas.length > 0) {
          const sortedByGoals = [...estadisticas].sort((a, b) => b.goles - a.goles)
          setTopGoleador(sortedByGoals[0])

          // Get historical MVP
          const sortedByMvps = [...estadisticas].sort((a, b) => b.mvps - a.mvps)
          setMvpHistorico(sortedByMvps[0])
        }

        // Get pending votes
        if (user.jugadorId) {
          const pendientes = await getVotacionesPendientes(user.jugadorId)
          setVotacionesPendientes(pendientes)
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Tordos FC</h1>
         <button onClick={handleLogout} className="bg-green-700 px-4 py-2 rounded hover:bg-green-800">
          Cerrar Sesión
         </button>
        </div>
      </nav>

      {votacionesPendientes.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800">
                Tenés {votacionesPendientes.length} votación{votacionesPendientes.length > 1 ? 'es' : ''} pendiente{votacionesPendientes.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => navigate('/historial')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Ir al Historial
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto p-8">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Cargando...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-2">Último Partido</h3>
                {ultimoPartido ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">
                      {ultimoPartido.goles_favor} - {ultimoPartido.goles_contra}
                    </p>
                    <p className="text-sm text-gray-600">
                      {ultimoPartido.resultado.charAt(0).toUpperCase() + ultimoPartido.resultado.slice(1)}
                      {ultimoPartido.rival && ` vs ${ultimoPartido.rival}`}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Sin partidos</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-2">Top Goleador</h3>
                {topGoleador ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">{topGoleador.apodo}</p>
                    <p className="text-sm text-gray-600">{topGoleador.goles} goles</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Sin datos</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-2">MVP Histórico</h3>
                {mvpHistorico ? (
                  <>
                    <p className="text-2xl font-bold text-green-600">{mvpHistorico.apodo}</p>
                    <p className="text-sm text-gray-600">{mvpHistorico.mvps} MVPs</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Sin datos</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-gray-500 text-sm mb-2">Próxima Fecha</h3>
                <p className="text-2xl font-bold text-green-600">Sábado</p>
                <p className="text-sm text-gray-600">15 de Junio</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => navigate('/cargar-partido')}
                className="bg-green-600 text-white p-8 rounded-lg shadow-md hover:bg-green-700 transition-colors text-xl font-semibold"
              >
                Cargar Partido
              </button>
              
              <button
                onClick={() => navigate('/historial')}
                className="bg-white text-green-600 p-8 rounded-lg shadow-md hover:bg-gray-50 transition-colors text-xl font-semibold border-2 border-green-600"
              >
                Historial de Partidos
              </button>
              
              <button
                onClick={() => navigate('/estadisticas')}
                className="bg-white text-green-600 p-8 rounded-lg shadow-md hover:bg-gray-50 transition-colors text-xl font-semibold border-2 border-green-600"
              >
                Estadísticas
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
