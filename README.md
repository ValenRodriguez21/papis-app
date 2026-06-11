# Tordos FC ⚽
```
App web full-stack para registrar y visualizar estadísticas de fútbol del grupo de amigos "Tordos". Permite cargar partidos, registrar goles y asistencias, puntuar a los compañeros post-partido y ver estadísticas históricas.

## Screenshots

### Dashboard
![Dashboard](<img width="1919" height="912" alt="Screenshot 2026-06-11 182911" src="https://github.com/user-attachments/assets/0b440e44-6e6e-4a34-a8b3-fb49a5b55860" />
)

### Cargar Partido
![Cargar Partido 1](<img width="1900" height="912" alt="Screenshot 2026-06-11 183125" src="https://github.com/user-attachments/assets/25366726-c83b-4e7a-89e2-b64047b599fb" />
)
![Cargar Partido 2](<img width="1900" height="910" alt="Screenshot 2026-06-11 183156" src="https://github.com/user-attachments/assets/9aca2ebe-1449-4861-9d0e-0ec7add70a3b" />
)

### Estadísticas
![Estadísticas](<img width="1900" height="909" alt="Screenshot 2026-06-11 183233" src="https://github.com/user-attachments/assets/cc7ac253-6326-4f9f-a6ca-b617cdaead3b" />
)

### Detalle Partido
![Detalle Partido](<img width="1900" height="910" alt="Screenshot 2026-06-11 183349" src="https://github.com/user-attachments/assets/abe58acf-c68c-407d-bf91-82167263fc6c" />
)

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL
- **Deploy**: Vercel (frontend) + Render (backend) + Supabase (DB)

## Estructura del Proyecto
papis-app/
├── frontend/          # Aplicación React
│   ├── src/
│   │   ├── api/      # Llamadas al backend
│   │   ├── hooks/    # Custom hooks
│   │   ├── pages/    # Páginas principales
│   │   └── ...
│   └── ...
├── backend/           # API Express
│   ├── src/
│   │   ├── db/       # Conexión a PostgreSQL
│   │   ├── routes/   # Rutas de la API
│   │   ├── middleware/ # Middleware de autenticación
│   │   ├── schema.sql # Esquema de base de datos
│   │   └── seed.ts   # Datos iniciales
│   └── ...
└── CONTEXT.md         # Especificación del proyecto
```

## Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL
- npm o yarn

### Backend

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de PostgreSQL:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tordos_fc
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=7d
PORT=3000
```

4. Crear la base de datos:
```bash
createdb tordos_fc
```

5. Ejecutar el esquema de base de datos:
```bash
psql -d tordos_fc -f src/schema.sql
```

6. Ejecutar el seed para cargar los jugadores iniciales:
```bash
npm run seed
```

7. Iniciar el servidor backend:
```bash
npm run dev
```

El backend correrá en `http://localhost:3000`

### Frontend

1. Navegar al directorio del frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

El archivo `.env` debería contener:
```
VITE_API_URL=http://localhost:3000/api
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend correrá en `http://localhost:5173`

## Uso

1. Abre `http://localhost:5173` en tu navegador
2. Inicia sesión con uno de los usuarios precargados (ej: `peque` / `peque123`)
3. Navega por las diferentes secciones:
   - **Dashboard**: Vista general con estadísticas rápidas
   - **Cargar Partido**: Registrar un nuevo partido
   - **Historial**: Ver todos los partidos registrados
   - **Estadísticas**: Ver estadísticas detalladas por jugador

## Características

- ✅ Autenticación con JWT
- ✅ Registro de partidos con goles, asistencias y resultado
- ✅ Sistema de puntuaciones post-partido (1-10) entre compañeros
- ✅ Votación de MVP por partido
- ✅ Notificación de votaciones pendientes
- ✅ Estadísticas históricas por jugador
- ✅ Historial de partidos con detalle
- ✅ Interfaz responsiva (mobile-friendly)
- ✅ Protección de rutas y manejo de token expirado

## Jugadores Precargados

| ID | Nombre  | Apodo    |
|----|---------|----------|
| 1  | Peque   | Peque    |
| 2  | Gione   | Gione    |
| 3  | Chonfra | Chonfra  |
| 4  | Fabri   | Fabri    |
| 5  | Dela    | Dela     |
| 6  | Chingolo| Chingolo |
| 7  | Davo    | Davo     |

## Scripts

### Backend
- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor en producción
- `npm run seed` - Cargar datos iniciales

### Frontend
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Previsualizar producción
