import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getJugadores } from '../api/jugadores'
import { createPartido } from '../api/partidos'

interface Jugador {
  id: number
  nombre: string
  apodo: string
}

interface Participacion {
  jugadorId: number
  goles: number
  asistencias: number
}

interface Valoracion {
  jugador_puntuado: number
  puntaje: number
  voto_mvp: boolean
}

export default function CargarPartido() {
  const navigate = useNavigate()
  
  const [fecha, setFecha] = useState('')
  const [rival, setRival] = useState('')
  const [golesFavor, setGolesFavor] = useState(0)
  const [golesContra, setGolesContra] = useState(0)
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState<number[]>([])
  const [participaciones, setParticipaciones] = useState<Participacion[]>([])
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [loadingJugadores, setLoadingJugadores] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [valoraciones, setValoraciones] = useState<Valoracion[]>([])

  // Get logged-in jugador ID
  const loggedJugadorId = JSON.parse(localStorage.getItem('user') || '{}').jugadorId

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        const data = await getJugadores()
        setJugadores(data)
      } catch (err) {
        setError('Error al cargar jugadores')
        console.error(err)
      } finally {
        setLoadingJugadores(false)
      }
    }

    fetchJugadores()
  }, [])

  const toggleJugador = (jugadorId: number) => {
    if (jugadoresSeleccionados.includes(jugadorId)) {
      setJugadoresSeleccionados(jugadoresSeleccionados.filter(id => id !== jugadorId))
      setParticipaciones(participaciones.filter(p => p.jugadorId !== jugadorId))
      setValoraciones(valoraciones.filter(v => v.jugador_puntuado !== jugadorId))
    } else {
      setJugadoresSeleccionados([...jugadoresSeleccionados, jugadorId])
      setParticipaciones([...participaciones, { jugadorId, goles: 0, asistencias: 0 }])
      setValoraciones([...valoraciones, { jugador_puntuado: jugadorId, puntaje: 5, voto_mvp: false }])
    }
  }

  const updateParticipacion = (jugadorId: number, field: keyof Participacion, value: number) => {
    setParticipaciones(participaciones.map(p =>
      p.jugadorId === jugadorId ? { ...p, [field]: value } : p
    ))
  }

  const updateValoracion = (jugadorId: number, field: keyof Valoracion, value: number | boolean) => {
    if (field === 'voto_mvp' && value === true) {
      // Solo un MVP por partido
      setValoraciones(valoraciones.map(v => ({
        ...v,
        voto_mvp: v.jugador_puntuado === jugadorId
      })))
    } else {
      setValoraciones(valoraciones.map(v =>
        v.jugador_puntuado === jugadorId ? { ...v, [field]: value } : v
      ))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validación: mínimo 3 jugadores
    if (jugadoresSeleccionados.length < 3) {
      setError('Deben participar al menos 3 jugadores')
      return
    }

    // Validación: MVP obligatorio en valoraciones
    const hasMvp = valoraciones.some(v => v.voto_mvp)
    if (!hasMvp) {
      setError('Debés elegir un MVP en las valoraciones')
      return
    }

    // Validación: suma de goles individuales no puede superar goles del equipo
    const totalGolesIndividuales = participaciones.reduce((sum, p) => sum + p.goles, 0)
    if (totalGolesIndividuales > golesFavor) {
      setError('La suma de goles individuales no puede superar los goles del equipo')
      return
    }

    setLoading(true)

    try {
      const partidoData = {
        fecha,
        rival: rival || undefined,
        golesFavor,
        golesContra,
        participaciones: participaciones.map(p => ({
          jugadorId: p.jugadorId,
          goles: p.goles,
          asistencias: p.asistencias
        })),
        puntuaciones: valoraciones.map(v => ({
          jugador_que_puntua: loggedJugadorId,
          jugador_puntuado: v.jugador_puntuado,
          puntaje: v.puntaje,
          voto_mvp: v.voto_mvp
        }))
      }

      await createPartido(partidoData)
      navigate('/dashboard')
    } catch (err) {
      setError('Error al guardar el partido')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-green-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-green-200">
            ← Volver
          </button>
          <h1 className="text-2xl font-bold">Cargar Partido</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="container mx-auto p-8">
        {loadingJugadores ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-xl">Cargando jugadores...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Información del Partido</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rival (opcional)</label>
                <input
                  type="text"
                  value={rival}
                  onChange={(e) => setRival(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Nombre del equipo rival"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goles a Favor</label>
                <input
                  type="number"
                  min="0"
                  value={golesFavor}
                  onChange={(e) => setGolesFavor(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goles en Contra</label>
                <input
                  type="number"
                  min="0"
                  value={golesContra}
                  onChange={(e) => setGolesContra(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-bold mb-4 text-green-700">Jugadores Presentes</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {jugadores.map((jugador) => (
                <label key={jugador.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jugadoresSeleccionados.includes(jugador.id)}
                    onChange={() => toggleJugador(jugador.id)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-gray-700">{jugador.apodo}</span>
                </label>
              ))}
            </div>

            {jugadoresSeleccionados.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Estadísticas Individuales</h3>
                
                {jugadoresSeleccionados.map((jugadorId) => {
                  const jugador = jugadores.find(j => j.id === jugadorId)
                  const participacion = participaciones.find(p => p.jugadorId === jugadorId)
                  
                  return (
                    <div key={jugadorId} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-green-700 mb-3">{jugador?.apodo}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Goles</label>
                          <input
                            type="number"
                            min="0"
                            value={participacion?.goles || 0}
                            onChange={(e) => updateParticipacion(jugadorId, 'goles', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Asistencias</label>
                          <input
                            type="number"
                            min="0"
                            value={participacion?.asistencias || 0}
                            onChange={(e) => updateParticipacion(jugadorId, 'asistencias', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {jugadoresSeleccionados.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4 text-green-700">Valoraciones</h2>
              <p className="text-sm text-gray-600 mb-4">Puntuá a tus compañeros (1-10) y elegí el MVP del partido</p>
              
              {jugadoresSeleccionados.filter(id => id !== loggedJugadorId).map((jugadorId) => {
                const jugador = jugadores.find(j => j.id === jugadorId)
                const valoracion = valoraciones.find(v => v.jugador_puntuado === jugadorId)
                
                return (
                  <div key={jugadorId} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-3">{jugador?.apodo}</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Puntaje (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={valoracion?.puntaje || 5}
                          onChange={(e) => updateValoracion(jugadorId, 'puntaje', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">{valoracion?.puntaje || 5}</div>
                      </div>
                      
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={valoracion?.voto_mvp || false}
                            onChange={(e) => updateValoracion(jugadorId, 'voto_mvp', e.target.checked)}
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar Partido'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
