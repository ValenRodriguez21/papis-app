import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import jugadoresRoutes from './routes/jugadores'
import partidosRoutes from './routes/partidos'
import estadisticasRoutes from './routes/estadisticas'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jugadores', jugadoresRoutes)
app.use('/api/partidos', partidosRoutes)
app.use('/api/estadisticas', estadisticasRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Tordos FC API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
