-- Create tables for Tordos FC

-- Jugadores table
CREATE TABLE IF NOT EXISTS jugadores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  apodo VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usuarios table (for authentication)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  jugador_id INT REFERENCES jugadores(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Partidos table
CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  rival VARCHAR(100),
  goles_favor INT DEFAULT 0,
  goles_contra INT DEFAULT 0,
  resultado VARCHAR(10), -- 'victoria', 'derrota', 'empate' (calculated)
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Participaciones table
CREATE TABLE IF NOT EXISTS participaciones (
  id SERIAL PRIMARY KEY,
  partido_id INT REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id INT REFERENCES jugadores(id),
  goles INT DEFAULT 0,
  asistencias INT DEFAULT 0,
  promedio_puntaje NUMERIC(4,2), -- promedio de las puntuaciones recibidas (calculado)
  votos_mvp INT DEFAULT 0, -- cantidad de votos MVP recibidos (calculado)
  es_mvp BOOLEAN DEFAULT false, -- true si fue el más votado como MVP
  UNIQUE(partido_id, jugador_id)
);

-- Puntuaciones table
CREATE TABLE IF NOT EXISTS puntuaciones (
  id SERIAL PRIMARY KEY,
  partido_id INT REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_que_puntua INT REFERENCES jugadores(id), -- quién puntúa
  jugador_puntuado INT REFERENCES jugadores(id), -- a quién puntúa
  puntaje INT CHECK (puntaje >= 1 AND puntaje <= 10),
  voto_mvp BOOLEAN DEFAULT false, -- si además lo marcó como MVP
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partido_id, jugador_que_puntua, jugador_puntuado)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partidos_fecha ON partidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_participaciones_partido ON participaciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_participaciones_jugador ON participaciones(jugador_id);
CREATE INDEX IF NOT EXISTS idx_puntuaciones_partido ON puntuaciones(partido_id);
