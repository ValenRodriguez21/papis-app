# Tordos FC - App de Estadísticas

App web para registrar y visualizar estadísticas de partidos de fútbol del grupo de amigos "Tordos".

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS (Vite)
- **Backend**: Node.js + Express
- **Base de datos**: PostgreSQL
- **Auth**: JWT (un usuario por jugador)

## Estructura del Proyecto

```
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

Esto creará 7 jugadores con usuarios:
- Usuario: `peque`, Contraseña: `peque123`
- Usuario: `gione`, Contraseña: `gione123`
- Usuario: `chonfra`, Contraseña: `chonfra123`
- Usuario: `fabri`, Contraseña: `fabri123`
- Usuario: `dela`, Contraseña: `dela123`
- Usuario: `chingolo`, Contraseña: `chingolo123`
- Usuario: `davo`, Contraseña: `davo123`

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
- ✅ Registro de partidos con goles y resultados
- ✅ Seguimiento de participaciones individuales
- ✅ Sistema de MVP por partido
- ✅ Estadísticas históricas por jugador
- ✅ Historial de partidos
- ✅ Interfaz responsiva con Tailwind CSS

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
