import express from 'express'
import pool from '../db'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = express.Router()

// Get all partidos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partidos ORDER BY fecha DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching partidos:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get partido by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM partidos WHERE id = $1',
      [req.params.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partido not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching partido:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get participaciones for a partido
router.get('/:id/participaciones', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, j.nombre, j.apodo 
       FROM participaciones p 
       JOIN jugadores j ON p.jugador_id = j.id 
       WHERE p.partido_id = $1`,
      [req.params.id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching participaciones:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create partido
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const { fecha, rival, golesFavor, golesContra, notas, participaciones, puntuaciones } = req.body

    // Calculate resultado
    let resultado = 'empate'
    if (golesFavor > golesContra) resultado = 'victoria'
    else if (golesFavor < golesContra) resultado = 'derrota'

    // Insert partido
    const partidoResult = await client.query(
      `INSERT INTO partidos (fecha, rival, goles_favor, goles_contra, resultado, notas) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [fecha, rival, golesFavor, golesContra, resultado, notas]
    )

    const partido = partidoResult.rows[0]

    // Insert participaciones
    for (const participacion of participaciones) {
      await client.query(
        `INSERT INTO participaciones (partido_id, jugador_id, goles, asistencias) 
         VALUES ($1, $2, $3, $4)`,
        [partido.id, participacion.jugadorId, participacion.goles, participacion.asistencias]
      )
    }

    // Insert puntuaciones if provided
    if (puntuaciones && puntuaciones.length > 0) {
      for (const puntuacion of puntuaciones) {
        await client.query(
          `INSERT INTO puntuaciones (partido_id, jugador_que_puntua, jugador_puntuado, puntaje, voto_mvp) 
           VALUES ($1, $2, $3, $4, $5)`,
          [partido.id, puntuacion.jugador_que_puntua, puntuacion.jugador_puntuado, puntuacion.puntaje, puntuacion.voto_mvp]
        )
      }

      // Recalculate promedio_puntaje and votos_mvp for participaciones
      await client.query(
        `UPDATE participaciones p 
         SET promedio_puntaje = COALESCE((
           SELECT AVG(puntaje) 
           FROM puntuaciones 
           WHERE partido_id = $1 AND jugador_puntuado = p.jugador_id
         ), 0),
         votos_mvp = COALESCE((
           SELECT COUNT(*) 
           FROM puntuaciones 
           WHERE partido_id = $1 AND jugador_puntuado = p.jugador_id AND voto_mvp = true
         ), 0)
         WHERE partido_id = $1`,
        [partido.id]
      )

      // Recalculate es_mvp (player with most MVP votes, tie-breaker by average score)
      await client.query(
        `UPDATE participaciones p 
         SET es_mvp = votos_mvp = (
           SELECT MAX(votos_mvp) 
           FROM participaciones 
           WHERE partido_id = $1
         ) AND (
           votos_mvp > 0 
           OR (votos_mvp = 0 AND promedio_puntaje = (
             SELECT MAX(promedio_puntaje) 
             FROM participaciones 
             WHERE partido_id = $1 AND votos_mvp = 0
           ))
         )
         WHERE partido_id = $1`,
        [partido.id]
      )
    }

    await client.query('COMMIT')

    res.status(201).json(partido)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error creating partido:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

// Add puntuaciones to a partido
router.post('/:id/puntuaciones', authMiddleware, async (req: AuthRequest, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const partidoId = parseInt(req.params.id)
    const { jugador_que_puntua, puntuaciones } = req.body

    // Validate jugador_que_puntua matches authenticated user
    if (req.jugadorId !== jugador_que_puntua) {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    // Check if partido exists
    const partidoResult = await client.query(
      'SELECT * FROM partidos WHERE id = $1',
      [partidoId]
    )
    if (partidoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partido not found' })
    }

    // Check if jugador_que_puntua already voted in this partido
    const existingVote = await client.query(
      'SELECT * FROM puntuaciones WHERE partido_id = $1 AND jugador_que_puntua = $2',
      [partidoId, jugador_que_puntua]
    )
    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'Ya has votado en este partido' })
    }

    // Validate that jugador doesn't vote for themselves
    for (const puntuacion of puntuaciones) {
      if (puntuacion.jugador_puntuado === jugador_que_puntua) {
        return res.status(400).json({ error: 'No puedes puntuarte a ti mismo' })
      }
    }

    // Insert puntuaciones
    for (const puntuacion of puntuaciones) {
      await client.query(
        `INSERT INTO puntuaciones (partido_id, jugador_que_puntua, jugador_puntuado, puntaje, voto_mvp) 
         VALUES ($1, $2, $3, $4, $5)`,
        [partidoId, jugador_que_puntua, puntuacion.jugador_puntuado, puntuacion.puntaje, puntuacion.voto_mvp]
      )
    }

    // Recalculate promedio_puntaje and votos_mvp for participaciones
    await client.query(
      `UPDATE participaciones p 
       SET promedio_puntaje = COALESCE((
         SELECT AVG(puntaje) 
         FROM puntuaciones 
         WHERE partido_id = $1 AND jugador_puntuado = p.jugador_id
       ), 0),
       votos_mvp = COALESCE((
         SELECT COUNT(*) 
         FROM puntuaciones 
         WHERE partido_id = $1 AND jugador_puntuado = p.jugador_id AND voto_mvp = true
       ), 0)
       WHERE partido_id = $1`,
      [partidoId]
    )

    // Recalculate es_mvp (player with most MVP votes, tie-breaker by average score)
    await client.query(
      `UPDATE participaciones p 
       SET es_mvp = votos_mvp = (
         SELECT MAX(votos_mvp) 
         FROM participaciones 
         WHERE partido_id = $1
       ) AND (
         votos_mvp > 0 
         OR (votos_mvp = 0 AND promedio_puntaje = (
           SELECT MAX(promedio_puntaje) 
           FROM participaciones 
           WHERE partido_id = $1 AND votos_mvp = 0
         ))
       )
       WHERE partido_id = $1`,
      [partidoId]
    )

    await client.query('COMMIT')

    res.status(201).json({ message: 'Puntuaciones guardadas correctamente' })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Error adding puntuaciones:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    client.release()
  }
})

export default router
