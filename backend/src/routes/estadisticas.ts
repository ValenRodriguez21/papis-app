import express from 'express'
import pool from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Get all estadisticas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        j.id,
        j.nombre,
        j.apodo,
        COUNT(DISTINCT p.id) as partidos_jugados,
        COALESCE(SUM(part.goles), 0) as goles,
        COALESCE(SUM(part.asistencias), 0) as asistencias,
        COALESCE(SUM(CASE WHEN part.es_mvp THEN 1 ELSE 0 END), 0) as mvps,
        COALESCE(AVG(part.promedio_puntaje), 0) as promedio_puntaje,
        COALESCE(SUM(CASE WHEN p.resultado = 'victoria' THEN 1 ELSE 0 END), 0) as victorias,
        COALESCE(SUM(CASE WHEN p.resultado = 'derrota' THEN 1 ELSE 0 END), 0) as derrotas,
        COALESCE(SUM(CASE WHEN p.resultado = 'empate' THEN 1 ELSE 0 END), 0) as empates
      FROM jugadores j
      LEFT JOIN participaciones part ON j.id = part.jugador_id
      LEFT JOIN partidos p ON part.partido_id = p.id
      WHERE j.activo = true
      GROUP BY j.id, j.nombre, j.apodo
      ORDER BY goles DESC
    `)

    const estadisticas = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      apodo: row.apodo,
      partidosJugados: parseInt(row.partidos_jugados),
      goles: parseInt(row.goles),
      asistencias: parseInt(row.asistencias),
      mvps: parseInt(row.mvps),
      promedioPuntaje: parseFloat(row.promedio_puntaje) || 0,
      victorias: parseInt(row.victorias),
      derrotas: parseInt(row.derrotas),
      empates: parseInt(row.empates),
      porcentajeVictorias: row.partidos_jugados > 0 
        ? (parseInt(row.victorias) / parseInt(row.partidos_jugados) * 100).toFixed(1)
        : '0.0'
    }))

    res.json(estadisticas)
  } catch (error) {
    console.error('Error fetching estadisticas:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get estadisticas for a specific jugador
router.get('/jugador/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        j.id,
        j.nombre,
        j.apodo,
        COUNT(DISTINCT p.id) as partidos_jugados,
        COALESCE(SUM(part.goles), 0) as goles,
        COALESCE(SUM(part.asistencias), 0) as asistencias,
        COALESCE(SUM(CASE WHEN part.es_mvp THEN 1 ELSE 0 END), 0) as mvps,
        COALESCE(AVG(part.promedio_puntaje), 0) as promedio_puntaje,
        COALESCE(SUM(CASE WHEN p.resultado = 'victoria' THEN 1 ELSE 0 END), 0) as victorias,
        COALESCE(SUM(CASE WHEN p.resultado = 'derrota' THEN 1 ELSE 0 END), 0) as derrotas,
        COALESCE(SUM(CASE WHEN p.resultado = 'empate' THEN 1 ELSE 0 END), 0) as empates
      FROM jugadores j
      LEFT JOIN participaciones part ON j.id = part.jugador_id
      LEFT JOIN partidos p ON part.partido_id = p.id
      WHERE j.id = $1
      GROUP BY j.id, j.nombre, j.apodo
    `, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador not found' })
    }

    const row = result.rows[0]
    const estadisticas = {
      id: row.id,
      nombre: row.nombre,
      apodo: row.apodo,
      partidosJugados: parseInt(row.partidos_jugados),
      goles: parseInt(row.goles),
      asistencias: parseInt(row.asistencias),
      mvps: parseInt(row.mvps),
      promedioPuntaje: parseFloat(row.promedio_puntaje) || 0,
      victorias: parseInt(row.victorias),
      derrotas: parseInt(row.derrotas),
      empates: parseInt(row.empates),
      porcentajeVictorias: row.partidos_jugados > 0 
        ? (parseInt(row.victorias) / parseInt(row.partidos_jugados) * 100).toFixed(1)
        : '0.0'
    }

    res.json(estadisticas)
  } catch (error) {
    console.error('Error fetching jugador estadisticas:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
