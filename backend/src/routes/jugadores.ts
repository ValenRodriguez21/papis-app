import express from 'express'
import pool from '../db'
import { authMiddleware } from '../middleware/auth'

const router = express.Router()

// Get all jugadores
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apodo, activo FROM jugadores WHERE activo = true ORDER BY id'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching jugadores:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get jugador by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, apodo, activo FROM jugadores WHERE id = $1',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Jugador not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching jugador:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get pending votes for a jugador
router.get('/:id/votaciones-pendientes', authMiddleware, async (req, res) => {
  try {
    const jugadorId = parseInt(req.params.id)

    // Get partidos where the jugador participated but hasn't voted yet
    const result = await pool.query(
      `SELECT DISTINCT p.id, p.fecha, p.rival, p.goles_favor, p.goles_contra, p.resultado
       FROM partidos p
       JOIN participaciones part ON p.id = part.partido_id
       WHERE part.jugador_id = $1
       AND NOT EXISTS (
         SELECT 1 FROM puntuaciones 
         WHERE partido_id = p.id AND jugador_que_puntua = $1
       )
       ORDER BY p.fecha DESC`,
      [jugadorId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching pending votes:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
