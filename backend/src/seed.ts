import pool from './db'
import bcrypt from 'bcryptjs'

const jugadores = [
  { id: 1, nombre: 'Peque', apodo: 'Peque' },
  { id: 2, nombre: 'Gione', apodo: 'Gione' },
  { id: 3, nombre: 'Chonfra', apodo: 'Chonfra' },
  { id: 4, nombre: 'Fabri', apodo: 'Fabri' },
  { id: 5, nombre: 'Dela', apodo: 'Dela' },
  { id: 6, nombre: 'Chingolo', apodo: 'Chingolo' },
  { id: 7, nombre: 'Davo', apodo: 'Davo' }
]

async function seed() {
  try {
    console.log('Starting seed...')

    // Insert jugadores
    for (const jugador of jugadores) {
      await pool.query(
        'INSERT INTO jugadores (id, nombre, apodo) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, apodo = EXCLUDED.apodo',
        [jugador.id, jugador.nombre, jugador.apodo]
      )
    }
    console.log('Jugadores inserted')

    // Create users for each jugador (username = apodo, password = apodo123)
    for (const jugador of jugadores) {
      const password = await bcrypt.hash(`${jugador.apodo.toLowerCase()}123`, 10)
      await pool.query(
        'INSERT INTO usuarios (username, password, jugador_id) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, jugador_id = EXCLUDED.jugador_id',
        [jugador.apodo.toLowerCase(), password, jugador.id]
      )
    }
    console.log('Usuarios created')

    console.log('Seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
