# Tordos FC — App de Estadísticas

## Descripción
App web para registrar y visualizar estadísticas de partidos de fútbol del grupo de amigos "Tordos". Son 7 jugadores que juegan todos los fines de semana, siempre como grupo armado contra equipos random. No siempre juegan todos, a veces son 3, 4 o más.

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **Auth**: JWT (un usuario por jugador)

---

## Jugadores (seed data)
Los siguientes jugadores deben estar precargados en la base de datos:

| id | nombre    | apodo     |
|----|-----------|-----------|
| 1  | Peque     | Peque     |
| 2  | Gione     | Gione     |
| 3  | Chonfra   | Chonfra   |
| 4  | Fabri     | Fabri     |
| 5  | Dela      | Dela      |
| 6  | Chingolo  | Chingolo  |
| 7  | Davo      | Davo      |

---

## Modelo de datos

### `jugadores`
```sql
id          SERIAL PRIMARY KEY
nombre      VARCHAR(50) NOT NULL
apodo       VARCHAR(50)
activo      BOOLEAN DEFAULT true
created_at  TIMESTAMP DEFAULT NOW()
```

### `partidos`
```sql
id           SERIAL PRIMARY KEY
fecha        DATE NOT NULL
rival        VARCHAR(100)         -- nombre del equipo rival (opcional)
goles_favor  INT DEFAULT 0
goles_contra INT DEFAULT 0
resultado    VARCHAR(10)          -- 'victoria', 'derrota', 'empate' (calculado)
notas        TEXT
created_at   TIMESTAMP DEFAULT NOW()
```

### `participaciones`
Registra qué jugadores participaron en cada partido y sus stats individuales.
```sql
id            SERIAL PRIMARY KEY
partido_id    INT REFERENCES partidos(id)
jugador_id    INT REFERENCES jugadores(id)
goles         INT DEFAULT 0
asistencias   INT DEFAULT 0
promedio_puntaje NUMERIC(4,2)   -- promedio de las puntuaciones recibidas (calculado)
votos_mvp     INT DEFAULT 0     -- cantidad de votos MVP recibidos (calculado)
es_mvp        BOOLEAN DEFAULT false  -- true si fue el más votado como MVP
```

### `puntuaciones`
Registra las puntuaciones que cada jugador le da a sus compañeros después del partido.
```sql
id                SERIAL PRIMARY KEY
partido_id        INT REFERENCES partidos(id)
jugador_que_puntua INT REFERENCES jugadores(id)   -- quién puntúa
jugador_puntuado   INT REFERENCES jugadores(id)   -- a quién puntúa
puntaje           INT CHECK (puntaje >= 1 AND puntaje <= 10)
voto_mvp          BOOLEAN DEFAULT false           -- si además lo marcó como MVP
created_at        TIMESTAMP DEFAULT NOW()
```

---

## Pantallas

### 1. Login
- Cada jugador tiene su usuario y contraseña
- JWT para autenticación

### 2. Home / Dashboard
- Nombre del grupo "Tordos"
- Último partido jugado (resultado)
- Top 3 goleadores históricos
- Próxima fecha (si se cargó)

### 3. Cargar Partido
- Fecha del partido
- Nombre del rival (opcional)
- Goles a favor / en contra
- Selección de jugadores que participaron (checkboxes)
- Para cada jugador presente: goles, asistencias, MVP (solo uno)
- Botón guardar

### 4. Historial de Partidos
- Lista de todos los partidos ordenados por fecha desc
- Resultado de cada uno (victoria/derrota/empate)
- Click para ver detalle

### 5. Estadísticas
Tabla con stats acumuladas por jugador:
- Partidos jugados
- Goles
- Asistencias
- MVPs
- Promedio de puntaje histórico (sobre 10)
- Victorias / Derrotas / Empates
- % victorias

### 6. Rivalidades (bonus)
- Head to head entre jugadores (quién jugó más partidos con quién)
- Racha actual del grupo

---

## Reglas de negocio
- Después de cada partido, cada jugador que participó puntúa a los demás del 1 al 10
- Un jugador no puede puntuarse a sí mismo
- Al puntuar, puede marcar una estrella para votar MVP (solo un voto MVP por jugador por partido)
- El MVP del partido es el jugador con más votos MVP; en caso de empate, gana el de mayor promedio
- El promedio de puntaje de cada jugador se calcula a partir de todas las puntuaciones recibidas en ese partido
- Un jugador puede no haber participado en un partido aunque esté en el grupo
- El resultado se calcula automáticamente comparando goles_favor vs goles_contra
- Las estadísticas son siempre del grupo como equipo (no hay partidos entre ellos)

---

## Convenciones de código
- Componentes en PascalCase
- Funciones y variables en camelCase
- Tablas y columnas de DB en snake_case
- Carpeta `components/` para componentes reutilizables
- Carpeta `pages/` para vistas principales
- Carpeta `hooks/` para custom hooks
- Carpeta `api/` para llamadas al backend
- Variables de entorno en `.env` (nunca hardcodeadas)

---

## Estado actual
Proyecto nuevo, sin código todavía. Arrancar por:
1. Setup del proyecto con Vite + React + TypeScript + Tailwind
2. Estructura de carpetas
3. Backend con Express + conexión a PostgreSQL
4. Seed data de jugadores
5. Pantalla de Login
6. Pantalla de Cargar Partido
