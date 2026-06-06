import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPartidoById, getParticipaciones, addPuntuaciones } from '../api/partidos'

export default function VotarPartido() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const partidoId = parseInt(id || '0')
  
  const [partido, setPartido] = useState<any>(null)
  const [participaciones, setParticipaciones] = useState<any[]>([])
  const [puntajes, setPuntajes] = useState<{ [key: number]: number }>({})
  const [mvpSeleccionado, setMvpSeleccionado] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const loggedJugadorId = user.jugadorId

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partidoData, participacionesData] = await Promise.all([
          getPartidoById(partidoId),
          getParticipaciones(partidoId)
        ])
        setPartido(partidoData)
        setParticipaciones(participacionesData)
        
        // Initialize puntajes for all players except the logged-in one
        const initialPuntajes: { [key: number]: number } = {}
        participacionesData
          .filter(p => parseInt(p.jugador_id) !== loggedJugadorId)
          .forEach(p => {
            initialPuntajes[parseInt(p.jugador_id)] = 5
          })
        setPuntajes(initialPuntajes)
      } catch (err) {
        setError('Error al cargar datos del partido')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [partidoId, loggedJugadorId])

  const updatePuntaje = (jugadorId: number, puntaje: number) => {
    setPuntajes(prev => ({
      ...prev,
      [jugadorId]: puntaje
    }))
  }

  const toggleMvp = (jugadorId: number) => {
    setMvpSeleccionado(prev => prev === jugadorId ? null : jugadorId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación: todos deben tener puntaje
    const jugadoresAVotar = participaciones.filter(p => parseInt(p.jugador_id) !== loggedJugadorId)
    const allHavePuntaje = jugadoresAVotar.every(p => {
      const puntaje = puntajes[parseInt(p.jugador_id)]
      return puntaje >= 1 && puntaje <= 10
    })
    if (!allHavePuntaje) {
      setError('Todos los jugadores deben tener un puntaje entre 1 y 10')
      return
    }

    // Validación: debe haber exactamente un MVP
    if (!mvpSeleccionado) {
      setError('Debés elegir un MVP')
      return
    }

    setSubmitting(true)

    try {
      const puntuaciones = jugadoresAVotar.map(p => ({
        jugador_puntuado: parseInt(p.jugador_id),
        puntaje: puntajes[parseInt(p.jugador_id)],
        voto_mvp: parseInt(p.jugador_id) === mvpSeleccionado
      }))
      await addPuntuaciones(partidoId, {
        jugador_que_puntua: loggedJugadorId,
        puntuaciones
      })
      navigate('/historial')
    } catch (err) {
      setError('Error al guardar las valoraciones')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/historial')} className="text-white hover:text-green-200">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Votar Partido</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Información del Partido</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500">
                {partido && new Date(partido.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="text-3xl font-bold text-green-600">{partido?.goles_favor}</span>
              <span className="text-gray-400">-</span>
              <span className="text-3xl font-bold text-red-600">{partido?.goles_contra}</span>
              {partido?.rival && (
                <span className="text-gray-600 ml-4">vs {partido.rival}</span>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Valoraciones</h2>
            <p className="text-sm text-gray-600 mb-4">Puntuá a tus compañeros (1-10) y elegí el MVP del partido</p>
            
            {participaciones
              .filter(p => parseInt(p.jugador_id) !== loggedJugadorId)
              .map((participacion) => {
                const jugadorId = parseInt(participacion.jugador_id)
                return (
                  <div key={jugadorId} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-3">{participacion.apodo}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Puntaje (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={puntajes[jugadorId] || 5}
                          onChange={(e) => updatePuntaje(jugadorId, parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">{puntajes[jugadorId] || 5}</div>
                      </div>
                      
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mvpSeleccionado === jugadorId}
                            onChange={() => toggleMvp(jugadorId)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-sm text-gray-700">⭐ MVP</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar Valoraciones'}
          </button>
        </form>
      </div>
    </div>
  )
}
